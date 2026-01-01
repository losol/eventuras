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
 */
export const getVatRate = (item: Order['items'][0]): number => {
  return item.price?.vatRate ?? 25;
};

/**
 * Calculate line total including VAT (in minor units)
 */
export const getLineTotalMinor = (item: Order['items'][0]): number => {
  const quantity = item.quantity || 1;
  const priceExVat = getPriceExVatMinor(item);
  const vatRate = getVatRate(item);
  return quantity * priceExVat * (1 + vatRate / 100);
};

/**
 * Calculate line total including VAT (in major units)
 */
export const getLineTotal = (item: Order['items'][0]): number => {
  return toMajorUnits(getLineTotalMinor(item));
};

/**
 * Get price including VAT (in minor units)
 */
export const getPriceIncVatMinor = (item: Order['items'][0]): number => {
  const priceExVat = getPriceExVatMinor(item);
  const vatRate = getVatRate(item);
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
