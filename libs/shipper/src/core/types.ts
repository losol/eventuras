/**
 * Common address structure used across shipping providers
 */
export interface Address {
  /** Full name of the person or company */
  name: string;
  /** Street address line 1 */
  addressLine1: string;
  /** Street address line 2 (optional) */
  addressLine2?: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** City name */
  city: string;
  /** ISO 3166-1 alpha-2 country code (e.g., 'NO', 'SE', 'DK') */
  countryCode: string;
  /** Contact phone number (optional) */
  phone?: string;
  /** Contact email address (optional) */
  email?: string;
}

/**
 * Package dimensions and weight
 */
export interface Package {
  /** Weight in grams */
  weightInGrams: number;
  /** Length in centimeters */
  lengthInCm: number;
  /** Width in centimeters */
  widthInCm: number;
  /** Height in centimeters */
  heightInCm: number;
}

/**
 * Common error structure for shipping operations
 */
export class ShippingError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ShippingError';
  }
}

/**
 * Authentication error for shipping provider API calls
 */
export class ShippingAuthError extends ShippingError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'ShippingAuthError';
  }
}
