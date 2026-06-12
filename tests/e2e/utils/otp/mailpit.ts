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
 */

import { Logger } from '@eventuras/logger';

import { extractLoginCode } from './code';

const logger = Logger.create({ namespace: 'e2e:mailpit' });

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
  const response = await fetch(`${base}${path}`);
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
    headers: { 'content-type': 'application/json' },
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
