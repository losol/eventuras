/**
 * Verification-code extraction shared by every OTP source (Gmail, Mailpit, …).
 *
 * Keeping the patterns in one place means a new mail backend reads the code the
 * same way the Gmail path always has.
 */

// Match either a numeric code (4–8 digits, e.g. tessera-otp's 6-digit "214923")
// or a 4–8 char tessera token (digits 2–9 + A–Z without I/O). The code is sent
// on its own line, so prefer the line-anchored match; fall back to a
// word-bounded match for HTML→text bodies.
const CODE = '[0-9]{4,8}|[2-9A-HJ-NP-Z]{4,8}';

/** Ordered from most to least specific; first match wins. */
export const OTP_CODE_PATTERNS: readonly RegExp[] = [
  new RegExp(`^\\s*(${CODE})\\s*$`, 'm'),
  new RegExp(`\\b(${CODE})\\b`),
];

/** Extracts the verification code from an email body, or null. */
export const extractLoginCode = (emailBody: string): string | null => {
  for (const pattern of OTP_CODE_PATTERNS) {
    const match = pattern.exec(emailBody);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
};
