/**
 * Verification-code extraction shared by every OTP source (Gmail, Mailpit, …).
 *
 * Keeping the patterns in one place means a new mail backend reads the code the
 * same way the Gmail path always has.
 */

// tessera-otp codes are 4 chars from the alphabet 23456789ABCDEFGHJKLMNPQRSTUVWXYZ
// (digits 2-9 + A-Z without I/O), so [2-9A-HJ-NP-Z].
/** Ordered from most to least specific; first match wins. */
export const OTP_CODE_PATTERNS: readonly RegExp[] = [
  // The code on its own line.
  /^\s*([2-9A-HJ-NP-Z]{4})\s*$/m,
  // Fallback: the same token, word-bounded (after an HTML→text conversion).
  /\b([2-9A-HJ-NP-Z]{4})\b/,
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
