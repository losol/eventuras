/**
 * Format phone number for display
 * Converts E.164 format (+4790503336) to human-readable format ((+47) 90503336)
 * @param phoneNumber - Phone number in E.164 format (e.g., "+4790503336")
 * @returns Formatted phone number (e.g., "(+47) 90503336") or original if not in expected format
 */
export function formatPhoneForDisplay(phoneNumber: string | undefined | null): string {
  if (!phoneNumber) return '';

  // Remove any existing formatting or whitespace
  const cleaned = phoneNumber.replace(/\s/g, '');

  // Match Norwegian phone numbers: +47 followed by 8 digits
  const norwegianMatch = cleaned.match(/^(\+47)(\d{8})$/);
  if (norwegianMatch) {
    return `(${norwegianMatch[1]}) ${norwegianMatch[2]}`;
  }

  // Match other international formats: + followed by country code and number
  const internationalMatch = cleaned.match(/^(\+\d{1,3})(\d+)$/);
  if (internationalMatch) {
    return `(${internationalMatch[1]}) ${internationalMatch[2]}`;
  }

  // Return original if no pattern matches
  return phoneNumber;
}
