/**
 * Format price with proper locale formatting
 * @param amount - Price amount (already in kr, not cents)
 * @param currency - Currency code (default: 'NOK')
 * @param locale - Locale for formatting (default: 'no')
 */
export function formatPrice(
  amount: number,
  currency: string = 'NOK',
  locale: string = 'no',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
