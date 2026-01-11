import type { Order, Product } from '@/payload-types';

/**
 * Convert minor units (øre) to major units (kr)
 */
export const toMajorUnits = (amount: number | null | undefined): number => (amount || 0) / 100;

/**
 * Get product name from order item
 */
export const getProductName = (item: Order['items'][0]): string => {
  const product = item.product as Product | string;
  if (typeof product === 'string') return 'Unknown Product';
  return product?.title || 'Unknown Product';
};

/**
 * Get product ID from order item
 */
export const getProductId = (item: Order['items'][0]): string => {
  const product = item.product as Product | string;
  return typeof product === 'string' ? product : product.id;
};

/**
 * Get price excluding VAT (in minor units)
 */
export const getPriceExVatMinor = (item: Order['items'][0]): number => {
  return item.price?.amountExVat || 0;
};

/**
 * Get VAT rate as percentage
 * @param item - The order item
 * @param isTaxExempt - Whether the entire order is tax exempt
 */
export const getVatRate = (item: Order['items'][0], isTaxExempt = false): number => {
  if (isTaxExempt) return 0;
  return item.price?.vatRate ?? 25;
};

/**
 * Calculate line total including VAT (in minor units)
 * @param item - The order item
 * @param isTaxExempt - Whether the entire order is tax exempt
 */
export const getLineTotalMinor = (item: Order['items'][0], isTaxExempt = false): number => {
  const quantity = item.quantity || 1;
  const priceExVat = getPriceExVatMinor(item);
  const vatRate = getVatRate(item, isTaxExempt);
  return quantity * priceExVat * (1 + vatRate / 100);
};

/**
 * Calculate line total including VAT (in major units)
 * @param item - The order item
 * @param isTaxExempt - Whether the entire order is tax exempt
 */
export const getLineTotal = (item: Order['items'][0], isTaxExempt = false): number => {
  return toMajorUnits(getLineTotalMinor(item, isTaxExempt));
};

/**
 * Get price including VAT (in minor units)
 * @param item - The order item
 * @param isTaxExempt - Whether the entire order is tax exempt
 */
export const getPriceIncVatMinor = (item: Order['items'][0], isTaxExempt = false): number => {
  const priceExVat = getPriceExVatMinor(item);
  const vatRate = getVatRate(item, isTaxExempt);
  return priceExVat * (1 + vatRate / 100);
};

/**
 * Format order date for display
 */
export const formatOrderDate = (
  createdAt: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(createdAt).toLocaleDateString('nb-NO', options);
};

/**
 * Escape HTML special characters to prevent XSS attacks
 * Strips any HTML tags and escapes special characters
 */
export const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Sanitize text by stripping HTML tags and escaping special characters
 * Use this for user-controlled data before inserting into HTML
 */
export const sanitizeForHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  // First strip any HTML tags, then escape special characters
  const stripped = text.replace(/<[^>]*>/g, '');
  return escapeHtml(stripped);
};
