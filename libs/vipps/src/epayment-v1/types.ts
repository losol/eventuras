/**
 * Vipps MobilePay ePayment API v1 Types
 *
 * Type definitions for the ePayment API.
 * https://developer.vippsmobilepay.com/docs/APIs/epayment-api/
 */

import type { PaymentAmount } from '../vipps-core';

/**
 * Payment state enumeration
 */
export type PaymentState =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'TERMINATED'
  | 'ABORTED'
  | 'EXPIRED';

/**
 * Payment method types
 */
export type PaymentMethodType = 'WALLET' | 'CARD';

/**
 * User flow types
 */
export type UserFlow = 'WEB_REDIRECT' | 'PUSH_MESSAGE' | 'QR' | 'NATIVE_REDIRECT';

/**
 * Customer information for payment
 */
export interface Customer {
  phoneNumber?: string;
}

/**
 * Profile scope for requesting user data sharing
 * Format: space-separated string of scope values
 * Valid values: "address", "birthDate", "email", "name", "phoneNumber"
 * Example: "name phoneNumber address birthDate email"
 */
export interface ProfileScopeRequest {
  /** Space-separated list of profile fields to request */
  scope: string;
}

/**
 * Order line for receipt/order management
 */
export interface OrderLine {
  /** Product name */
  name: string;
  /** Product ID */
  id: string;
  /** Total amount for this line in minor units (øre) */
  totalAmount: number;
  /** Amount excluding tax in minor units */
  totalAmountExcludingTax?: number;
  /** Tax amount in minor units */
  totalTaxAmount?: number;
  /** Tax percentage (e.g., 25 for 25%) */
  taxPercentage?: number;
  unitInfo?: {
    /** Price per unit in minor units */
    unitPrice: number;
    /** Quantity as string (e.g., "2", "2.5") */
    quantity: string;
    /** Unit of quantity (e.g., "PCS", "KG", "LITERS") */
    quantityUnit: string;
  };
  /** Discount amount in minor units */
  discount?: number;
  /** URL to product page */
  productUrl?: string;
  /** Whether this is a return line */
  isReturn?: boolean;
  /** Whether this is a shipping line */
  isShipping?: boolean;
  /** Whether this is a gift card */
  isGiftCard?: boolean;
}

/**
 * Bottom line summary for order
 */
export interface BottomLine {
  /** ISO 4217 currency code */
  currency: string;
  /** Tip amount in minor units */
  tipAmount?: number;
  /** Gift card amount in minor units */
  giftCardAmount?: number;
  /** Terminal ID for POS systems */
  terminalId?: string;
  /** POS ID for point of sale systems */
  posId?: string;
  /** Receipt number for POS systems */
  receiptNumber?: string;
}

/**
 * Receipt information for order details
 */
export interface Receipt {
  /** Line items in the order */
  orderLines: OrderLine[];
  /** Order summary information */
  bottomLine?: BottomLine;
}

/**
 * Create payment request
 */
export interface CreatePaymentRequest {
  amount: PaymentAmount;
  paymentMethod: {
    type: PaymentMethodType;
  };
  customer?: Customer;
  /** Request user profile data sharing */
  profile?: ProfileScopeRequest;
  /** Unique merchant reference for the payment */
  reference: string;
  /** Required for WEB_REDIRECT flow */
  returnUrl?: string;
  userFlow: UserFlow;
  paymentDescription?: string;
  /** Receipt with order details for Vipps app */
  receipt?: Receipt;
}

/**
 * Create payment response
 */
export interface CreatePaymentResponse {
  reference: string;
  redirectUrl: string;
  pspReference?: string;
}

/**
 * Payment aggregate details
 */
export interface PaymentAggregate {
  authorizedAmount: PaymentAmount;
  cancelledAmount: PaymentAmount;
  capturedAmount: PaymentAmount;
  refundedAmount: PaymentAmount;
}

/**
 * Payment details response
 */
export interface PaymentDetails {
  aggregate: PaymentAggregate;
  amount: PaymentAmount;
  state: PaymentState;
  paymentMethod: {
    type: PaymentMethodType;
  };
  profile?: {
    email?: string;
    givenName?: string;
    familyName?: string;
    birthdate?: string;
    phoneNumber?: string;
  };
  userDetails?: {
    userId?: string;
    firstName?: string;
    lastName?: string;
    mobileNumber?: string;
    email?: string;
    ssn?: string;
    streetAddress?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  pspReference: string;
  reference: string;
}

/**
 * Payment event types
 */
export type PaymentEventName =
  | 'CREATED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'AUTHORIZED'
  | 'TERMINATED'
  | 'CANCELLED'
  | 'CAPTURED'
  | 'REFUNDED';

/**
 * Payment event log entry
 */
export interface PaymentEvent {
  name: PaymentEventName;
  amount?: PaymentAmount;
  idempotencyKey?: string;
  pspReference: string;
  success: boolean;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/**
 * Capture payment request
 */
export interface CapturePaymentRequest {
  modificationAmount: PaymentAmount;
}

/**
 * Refund payment request
 */
export interface RefundPaymentRequest {
  modificationAmount: PaymentAmount;
}
