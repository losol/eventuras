/* eslint no-process-env: 0 */

/**
 * Mailpit OTP reader for the E2E suite.
 *
 * Test-only infrastructure: the non-production Keycloak test realms deliver
 * email-OTP to a Mailpit SMTP sink instead of a real inbox, so this reads the
 * verification code from Mailpit's REST API. It mirrors the Gmail reader in
 * {@link ./gmail} (same signature, polling, and code regex) and is selected via
 * `E2E_OTP_SOURCE=mailpit` by {@link ./index}.
 *
 * Mailpit HTTP API (default port 8025): https://mailpit.axllent.org/docs/api-v1/
 *
 * In CI the public Mailpit endpoint sits behind oauth2-proxy ForwardAuth, which
 * accepts bearer tokens. When `E2E_MAILPIT_CLIENT_ID` / `E2E_MAILPIT_CLIENT_SECRET`
 * / `E2E_MAILPIT_TOKEN_URL` are set, every request carries a
 * service-account token (client_credentials grant). They are optional so a local
 * Mailpit reached directly still works with no auth.
 */

import { Logger } from '@eventuras/logger';

import { extractLoginCode } from './code';

const logger = Logger.create({ namespace: 'e2e:mailpit' });

interface TokenResponse {
  access_token: string;
  expires_in?: number;
}

let cachedToken: { value: string; expiresAt: number; } | null = null;

/**
 * Bearer token for the oauth2-proxy in front of Mailpit, via the Keycloak
 * `client_credentials` grant. Returns null when no client credentials are
 * configured (e.g. a local Mailpit reached directly), so auth is simply omitted.
 * Cached until shortly before it expires.
 */
const getBearerToken = async (): Promise<string | null> => {
  const tokenUrl = process.env.E2E_MAILPIT_TOKEN_URL;
  const clientId = process.env.E2E_MAILPIT_CLIENT_ID;
  const clientSecret = process.env.E2E_MAILPIT_CLIENT_SECRET;
  if (!tokenUrl || !clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!response.ok) {
    throw new Error(`Mailpit token request failed: ${response.status} ${response.statusText}`);
  }

  const token = (await response.json()) as TokenResponse;
  if (!token.access_token) {
    throw new Error('Mailpit token response did not contain an access_token');
  }

  // Refresh a little early so a token never expires mid-request. Cap the skew at
  // half the TTL so a short-lived token still gets a positive lifetime here.
  const ttlMs = (token.expires_in ?? 60) * 1000;
  const skewMs = Math.min(5000, Math.floor(ttlMs / 2));
  cachedToken = { value: token.access_token, expiresAt: now + ttlMs - skewMs };
  return token.access_token;
};

/** Authorization header for Mailpit requests; empty when no credentials are set. */
const authHeaders = async (): Promise<Record<string, string>> => {
  const token = await getBearerToken();
  return token ? { authorization: `Bearer ${token}` } : {};
};

interface MailpitMessageSummary {
  ID: string;
  Subject?: string;
}

interface MailpitSearchResult {
  messages?: MailpitMessageSummary[];
}

interface MailpitMessage {
  ID: string;
  Text?: string;
  HTML?: string;
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/** Base URL of the Mailpit API, without a trailing slash. */
const getApiUrl = (): string => {
  const url = process.env.E2E_MAILPIT_API_URL;
  if (!url) {
    throw new Error('E2E_MAILPIT_API_URL must be set when E2E_OTP_SOURCE=mailpit');
  }
  return url.replace(/\/+$/, '');
};

const mailpitGet = async <T>(base: string, path: string): Promise<T> => {
  const response = await fetch(`${base}${path}`, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(`Mailpit GET ${path} failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

/** Messages addressed to `userEmail`, newest first. */
const searchByRecipient = (
  base: string,
  userEmail: string,
  limit: number
): Promise<MailpitSearchResult> =>
  mailpitGet(base, `/api/v1/search?query=${encodeURIComponent(`to:${userEmail}`)}&limit=${limit}`);

/**
 * Deletes the given message IDs. No-op on an empty list — Mailpit's DELETE
 * endpoint would otherwise wipe *all* messages when handed an empty ID list.
 */
const deleteMessages = async (base: string, ids: string[]): Promise<void> => {
  if (ids.length === 0) {
    return;
  }
  const response = await fetch(`${base}/api/v1/messages`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ IDs: ids }),
  });
  if (!response.ok) {
    // Non-fatal: the post-read delete is best-effort de-duplication.
    logger.debug({ status: response.status, ids }, 'Mailpit delete failed (ignored)');
  }
};

/**
 * Fetches the login/verification code for `userEmail` from Mailpit.
 * Polls newest-first until a message yields a code or the attempts run out, then
 * deletes that message so a re-run can't pick up a stale code.
 */
export const fetchLoginCodeViaMailpit = async (
  userEmail: string,
  maxRetries = 20,
  intervalMs = 3000
): Promise<string> => {
  const base = getApiUrl();
  logger.debug({ userEmail, maxRetries, intervalMs }, 'Fetching login code from Mailpit');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { messages = [] } = await searchByRecipient(base, userEmail, 10);

    for (const summary of messages) {
      const message = await mailpitGet<MailpitMessage>(base, `/api/v1/message/${summary.ID}`);
      const code = extractLoginCode(message.Text || message.HTML || '');
      if (code) {
        logger.debug({ messageId: summary.ID }, 'Matched verification code, deleting message');
        await deleteMessages(base, [summary.ID]);
        return code;
      }
    }

    if (attempt < maxRetries) {
      await sleep(intervalMs);
    }
  }

  throw new Error(
    `No verification emails received for ${userEmail} after ${maxRetries} attempts (Mailpit)`
  );
};

/**
 * Deletes all messages addressed to `userEmail` so a test run starts clean.
 * @returns Number of messages deleted.
 */
export const cleanupOtpEmailsViaMailpit = async (userEmail: string): Promise<number> => {
  const base = getApiUrl();
  const { messages = [] } = await searchByRecipient(base, userEmail, 200);
  const ids = messages.map(message => message.ID);

  await deleteMessages(base, ids);
  logger.debug({ count: ids.length, userEmail }, 'Cleaned up Mailpit OTP messages');
  return ids.length;
};
