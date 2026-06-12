/* eslint no-process-env: 0 */

/**
 * Pluggable email-OTP reader for the E2E suite.
 *
 * The suite logs in via the real email-OTP flow; this reads the verification
 * code from whichever inbox the tier delivers to, selected by `E2E_OTP_SOURCE`:
 *
 * - `gmail` (default, back-compat) — a real Gmail inbox via the Google API.
 * - `mailpit` — the Mailpit SMTP sink used by the Keycloak test realms.
 *
 * Both backends share the same signature, polling, and code regex. All of this
 * is test-only infrastructure — nothing here is reusable in production.
 */

import { cleanupOtpEmailsViaGmail, fetchLoginCodeViaGmail } from './gmail';
import { cleanupOtpEmailsViaMailpit, fetchLoginCodeViaMailpit } from './mailpit';

export { initializeGmailClient } from './gmail';

type OtpSource = 'gmail' | 'mailpit';

/** Selects the OTP backend from `E2E_OTP_SOURCE` (default `gmail`). */
const getOtpSource = (): OtpSource => {
  const source = (process.env.E2E_OTP_SOURCE ?? 'gmail').toLowerCase();
  if (source === 'gmail' || source === 'mailpit') {
    return source;
  }
  throw new Error(`Unknown E2E_OTP_SOURCE "${source}" (expected "gmail" or "mailpit")`);
};

/**
 * Fetches the login/verification code for a recipient from the configured OTP
 * source (Gmail or Mailpit).
 *
 * @param userEmail - The recipient address the suite logged in as
 * @param maxRetries - Maximum number of polling attempts (default: 20)
 * @param intervalMs - Milliseconds between retry attempts (default: 3000)
 */
export const fetchLoginCode = (
  userEmail: string,
  maxRetries = 20,
  intervalMs = 3000
): Promise<string> =>
  getOtpSource() === 'mailpit'
    ? fetchLoginCodeViaMailpit(userEmail, maxRetries, intervalMs)
    : fetchLoginCodeViaGmail(userEmail, maxRetries, intervalMs);

/**
 * Cleans up all OTP/verification code emails for a recipient from the configured
 * OTP source, so a run starts from a clean state.
 *
 * @param userEmail - The recipient address to clean up verification emails for
 * @returns Number of emails removed
 */
export const cleanupOtpEmails = (userEmail: string): Promise<number> =>
  getOtpSource() === 'mailpit'
    ? cleanupOtpEmailsViaMailpit(userEmail)
    : cleanupOtpEmailsViaGmail(userEmail);
