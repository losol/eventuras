/**
 * Price calculation utilities for products
 * All amounts in the database are stored in minor units (øre/cents)
 */

import { getCurrency } from '@/currencies';

/**
 * Calculate price excluding VAT from total price including VAT
 */
export function calculatePriceExcludingVat(
  totalIncVat: number,
  vatRate: number,
): number {
  return Math.round(totalIncVat / (1 + vatRate / 100));
}

/**
 * Calculate VAT amount from price excluding VAT
 */
export function calculateVatAmount(priceExVat: number, vatRate: number): number {
  return Math.round(priceExVat * (vatRate / 100));
}

/**
 * Calculate total price including VAT
 */
export function calculatePriceIncludingVat(
  priceExVat: number,
  vatRate: number,
): number {
  return priceExVat + calculateVatAmount(priceExVat, vatRate);
}

/**
 * Get the multiplier for converting between major and minor units
 * @param currencyCode - Currency code (e.g., 'NOK', 'USD')
 * @returns The multiplier (e.g., 100 for 2 decimals, 1000 for 3 decimals)
 */
export function getCurrencyMultiplier(currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  return Math.pow(10, currency?.decimals ?? 2);
}

/**
 * Convert from minor units to major units
 * @param amount - Amount in minor units (øre/cents)
 * @param currencyCode - Currency code
 * @returns Amount in major units (kr/dollars)
 */
export function fromMinorUnits(amount: number, currencyCode: string): number {
  return amount / getCurrencyMultiplier(currencyCode);
}

/**
 * Convert from major units to minor units
 * @param amount - Amount in major units (kr/dollars)
 * @param currencyCode - Currency code
 * @returns Amount in minor units (øre/cents)
 */
export function toMinorUnits(amount: number, currencyCode: string): number {
  return Math.round(amount * getCurrencyMultiplier(currencyCode));
}

/**
 * Calculate line total (price * quantity) in minor units
 */
export function calculateLineTotal(
  pricePerUnit: number,
  quantity: number,
): number {
  return pricePerUnit * quantity;
}
