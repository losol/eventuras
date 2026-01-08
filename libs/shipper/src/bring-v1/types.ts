import type { Address, Package } from '../core/types';

/**
 * Configuration for Bring API client
 */
export interface BringConfig {
  /** Bring API base URL (test: https://api.qa.bring.com, prod: https://api.bring.com) */
  apiUrl: string;
  /** Mybring user email address (API UID) */
  apiUid: string;
  /** Mybring API key */
  apiKey: string;
  /** Bring customer number */
  customerId: string;
  /** Client URL that identifies where you're using the API (e.g., 'https://eventuras.losol.io') */
  clientUrl: string;
  /**
   * Explicitly set test mode (true/false).
   * If not provided, auto-detects based on apiUrl containing 'qa' or 'test'
   */
  testMode?: boolean;
}

/**
 * Bring-specific consignment data for creating a shipment
 */
export interface BringConsignment {
  /** Correlation ID for tracking requests */
  correlationId?: string;
  /** Shipping date (ISO 8601 format: YYYY-MM-DD) */
  shippingDateTime: string;
  /** List of parties involved in the shipment */
  parties: BringParties;
  /** Product code (e.g., 'SERVICEPAKKE', 'PA_DOREN', etc.) */
  product: BringProduct;
  /** List of packages in the consignment */
  packages: BringPackage[];
}

/**
 * Parties involved in a Bring shipment
 */
export interface BringParties {
  sender: BringAddress;
  recipient: BringAddress;
}

/**
 * Bring-specific address format
 */
export interface BringAddress {
  name: string;
  addressLine: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  countryCode: string;
  reference?: string;
  contact?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
}

/**
 * Bring product configuration
 */
export interface BringProduct {
  /** Product ID (e.g., 'SERVICEPAKKE') */
  id: string;
  /** Customer number responsible for the shipment */
  customerNumber: string;
}

/**
 * Bring package specification
 */
export interface BringPackage {
  /** Package ID/correlation ID */
  correlationId: string;
  /** Weight in grams */
  weightInGrams: number;
  /** Dimensions in centimeters */
  dimensions?: {
    heightInCm: number;
    widthInCm: number;
    lengthInCm: number;
  };
}

/**
 * Response from creating a Bring shipment
 */
export interface BringShipmentResponse {
  consignments: BringConsignmentResponse[];
  errors?: BringError[];
}

/**
 * Individual consignment in the response
 */
export interface BringConsignmentResponse {
  correlationId?: string;
  confirmation: {
    /** Consignment number (tracking number) */
    consignmentNumber: string;
    /** Expected delivery date and time */
    dateAndTimes?: {
      expectedDelivery?: string;
    };
    links: {
      /** Link to tracking page */
      tracking: string;
      /** Link to label (PDF) */
      labels?: string;
    };
    /** Package details with tracking numbers */
    packages?: Array<{
      /** Package tracking number */
      packageNumber: string;
    }>;
  };
}

/**
 * Bring API error structure
 */
export interface BringError {
  code: string;
  messages: Array<{
    lang: string;
    message: string;
  }>;
  uniqueId: string;
}

/**
 * Helper to convert common Address to Bring format
 */
export function toBringAddress(address: Address): BringAddress {
  return {
    name: address.name,
    addressLine: address.addressLine1,
    addressLine2: address.addressLine2,
    postalCode: address.postalCode,
    city: address.city,
    countryCode: address.countryCode,
    contact: address.email || address.phone ? {
      email: address.email,
      phoneNumber: address.phone,
    } : undefined,
  };
}

/**
 * Helper to convert common Package to Bring format
 */
export function toBringPackage(pkg: Package, correlationId: string): BringPackage {
  return {
    correlationId,
    weightInGrams: pkg.weightInGrams,
    dimensions: {
      heightInCm: pkg.heightInCm,
      widthInCm: pkg.widthInCm,
      lengthInCm: pkg.lengthInCm,
    },
  };
}
