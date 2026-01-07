import type { Address, Package } from '../core/types';

/**
 * Validation utilities for shipping data
 */

/**
 * Validate an address object
 * @param address - Address to validate
 * @throws {Error} if address is invalid
 */
export function validateAddress(address: Address): void {
  const errors: string[] = [];

  if (!address.name || address.name.trim().length === 0) {
    errors.push('Address name is required');
  }

  if (!address.addressLine1 || address.addressLine1.trim().length === 0) {
    errors.push('Address line 1 is required');
  }

  if (!address.postalCode || address.postalCode.trim().length === 0) {
    errors.push('Postal code is required');
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!address.countryCode || address.countryCode.trim().length === 0) {
    errors.push('Country code is required');
  }

  // Validate country code format (ISO 3166-1 alpha-2)
  if (address.countryCode && !/^[A-Z]{2}$/.test(address.countryCode)) {
    errors.push('Country code must be a 2-letter ISO 3166-1 alpha-2 code (e.g., NO, SE, DK)');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid address: ${errors.join(', ')}`);
  }
}

/**
 * Validate a package object
 * @param pkg - Package to validate
 * @throws {Error} if package is invalid
 */
export function validatePackage(pkg: Package): void {
  const errors: string[] = [];

  if (!pkg.weightInGrams || pkg.weightInGrams <= 0) {
    errors.push('Weight must be greater than 0 grams');
  }

  if (!pkg.lengthInCm || pkg.lengthInCm <= 0) {
    errors.push('Length must be greater than 0 cm');
  }

  if (!pkg.widthInCm || pkg.widthInCm <= 0) {
    errors.push('Width must be greater than 0 cm');
  }

  if (!pkg.heightInCm || pkg.heightInCm <= 0) {
    errors.push('Height must be greater than 0 cm');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid package: ${errors.join(', ')}`);
  }
}

/**
 * Validate a shipping date
 * @param dateString - Date in ISO 8601 format (YYYY-MM-DD)
 * @throws {Error} if date is invalid
 */
export function validateShippingDate(dateString: string): void {
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error('Shipping date must be in ISO 8601 format (YYYY-MM-DD)');
  }

  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid shipping date');
  }

  // Check if date is in the past (more than 1 day ago)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (date < yesterday) {
    throw new Error('Shipping date cannot be in the past');
  }
}

/**
 * Validate a tracking number format
 * @param trackingNumber - Tracking number to validate
 * @throws {Error} if tracking number is invalid
 */
export function validateTrackingNumber(trackingNumber: string): void {
  if (!trackingNumber || trackingNumber.trim().length === 0) {
    throw new Error('Tracking number is required');
  }

  // Bring tracking numbers are typically alphanumeric
  if (!/^[A-Z0-9]+$/.test(trackingNumber.trim())) {
    throw new Error('Tracking number must contain only uppercase letters and numbers');
  }
}
