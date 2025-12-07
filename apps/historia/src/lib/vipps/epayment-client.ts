/**
 * Vipps MobilePay ePayment API Client
 *
 * This module provides utilities for interacting with the Vipps MobilePay ePayment API.
 * https://developer.vippsmobilepay.com/docs/APIs/epayment-api/
 */

import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config';

const logger = Logger.create({
  namespace: 'historia:vipps',
  context: { module: 'epaymentClient' },
});

// API Configuration
const VIPPS_API_URL = appConfig.env.VIPPS_API_URL || 'https://apitest.vipps.no';
const VIPPS_MERCHANT_SERIAL_NUMBER = appConfig.env.VIPPS_MERCHANT_SERIAL_NUMBER as string | undefined;
const VIPPS_CLIENT_ID = appConfig.env.VIPPS_CLIENT_ID as string | undefined;
const VIPPS_CLIENT_SECRET = appConfig.env.VIPPS_CLIENT_SECRET as string | undefined;
const VIPPS_SUBSCRIPTION_KEY = appConfig.env.VIPPS_SUBSCRIPTION_KEY as string | undefined;

// System identification for Vipps
const SYSTEM_NAME = 'eventuras-historia';
const SYSTEM_VERSION = '1.0.0';
const PLUGIN_NAME = 'eventuras-historia-commerce';
const PLUGIN_VERSION = '1.0.0';

/**
 * Access token response from Vipps
 */
interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  expires_on: string;
  not_before: string;
  resource: string;
  token_type_hint?: string;
}

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
 * Amount object for payments
 */
export interface PaymentAmount {
  value: number; // Amount in minor units (øre for NOK)
  currency: string; // ISO 4217 currency code (e.g., "NOK")
}

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
  scope: string; // Space-separated list of profile fields to request
}

/**
 * Order line for receipt/order management
 */
export interface OrderLine {
  name: string; // Product name
  id: string; // Product ID
  totalAmount: number; // Total amount for this line in minor units (øre)
  totalAmountExcludingTax?: number; // Amount excluding tax in minor units
  totalTaxAmount?: number; // Tax amount in minor units
  taxPercentage?: number; // Tax percentage (e.g., 25 for 25%)
  unitInfo?: {
    unitPrice: number; // Price per unit in minor units
    quantity: string; // Quantity as string (e.g., "2", "2.5")
    quantityUnit: string; // Unit of quantity (e.g., "PCS", "KG", "LITERS")
  };
  discount?: number; // Discount amount in minor units
  productUrl?: string; // URL to product page
  isReturn?: boolean; // Whether this is a return line
  isShipping?: boolean; // Whether this is a shipping line
  isGiftCard?: boolean; // Whether this is a gift card
}

/**
 * Bottom line summary for order
 */
export interface BottomLine {
  currency: string; // ISO 4217 currency code
  tipAmount?: number; // Tip amount in minor units
  giftCardAmount?: number; // Gift card amount in minor units
  terminalId?: string; // Terminal ID for POS systems
  posId?: string; // POS ID for point of sale systems
  receiptNumber?: string; // Receipt number for POS systems
}

/**
 * Receipt information for order details
 */
export interface Receipt {
  orderLines: OrderLine[]; // Line items in the order
  bottomLine?: BottomLine; // Order summary information
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
  profile?: ProfileScopeRequest; // Request user profile data sharing
  reference: string; // Unique merchant reference for the payment
  returnUrl?: string; // Required for WEB_REDIRECT flow
  userFlow: UserFlow;
  paymentDescription?: string;
  receipt?: Receipt; // Receipt with order details for Vipps app
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
  timestamp: string; // ISO 8601 timestamp
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

/**
 * Get Vipps access token using client credentials
 */
export async function getAccessToken(): Promise<string> {
  const startTime = Date.now();

  try {
    if (!VIPPS_CLIENT_ID || !VIPPS_CLIENT_SECRET || !VIPPS_SUBSCRIPTION_KEY) {
      logger.error(
        {
          hasClientId: !!VIPPS_CLIENT_ID,
          hasClientSecret: !!VIPPS_CLIENT_SECRET,
          hasSubscriptionKey: !!VIPPS_SUBSCRIPTION_KEY,
          hasMerchantSerialNumber: !!VIPPS_MERCHANT_SERIAL_NUMBER,
        },
        'Missing Vipps API credentials'
      );
      throw new Error('Vipps configuration error: Missing API credentials');
    }

    logger.info('Fetching Vipps access token');

    const response = await fetch(`${VIPPS_API_URL}/accesstoken/get`, {
      method: 'POST',
      headers: {
        'client_id': VIPPS_CLIENT_ID,
        'client_secret': VIPPS_CLIENT_SECRET,
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          responseTimeMs: responseTime,
        },
        'Failed to get Vipps access token'
      );
      throw new Error(`Vipps authentication failed: ${response.status}`);
    }

    const data = (await response.json()) as AccessTokenResponse;
    logger.info(
      {
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        responseTimeMs: responseTime,
      },
      'Successfully obtained Vipps access token'
    );

    return data.access_token;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(
      {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs: responseTime,
      },
      'Error getting Vipps access token'
    );
    throw error;
  }
}

/**
 * Build common headers for ePayment API requests
 */
function buildHeaders(accessToken: string, idempotencyKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY || '',
    'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
    'Vipps-System-Name': SYSTEM_NAME,
    'Vipps-System-Version': SYSTEM_VERSION,
    'Vipps-System-Plugin-Name': PLUGIN_NAME,
    'Vipps-System-Plugin-Version': PLUGIN_VERSION,
  };

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  return headers;
}

/**
 * Create a new payment
 * POST /epayment/v1/payments
 */
export async function createPayment(
  request: CreatePaymentRequest,
  idempotencyKey?: string
): Promise<CreatePaymentResponse> {
  const startTime = Date.now();

  try {
    logger.info(
      {
        requestBody: request,
      },
      'Creating Vipps ePayment'
    );

    const accessToken = await getAccessToken();
    const headers = buildHeaders(accessToken, idempotencyKey || request.reference);

    const response = await fetch(`${VIPPS_API_URL}/epayment/v1/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference: request.reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          requestBody: request,
          responseTimeMs: responseTime,
        },
        'Failed to create ePayment'
      );
      throw new Error(`Failed to create payment: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as CreatePaymentResponse;

    logger.info(
      {
        reference: request.reference,
        pspReference: data.pspReference,
        hasRedirectUrl: !!data.redirectUrl,
        responseTimeMs: responseTime,
      },
      'Successfully created ePayment'
    );

    // Log full response for debugging
    logger.debug(
      {
        fullResponse: data,
      },
      'ePayment API Response'
    );

    return data;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference: request.reference,
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs: responseTime,
      },
      'Error creating ePayment'
    );
    throw error;
  }
}

/**
 * Get payment details
 * GET /epayment/v1/payments/{reference}
 */
export async function getPaymentDetails(reference: string): Promise<PaymentDetails> {

  try {
    logger.info({ reference }, 'Getting payment details');

    const accessToken = await getAccessToken();
    const headers = buildHeaders(accessToken);

    const response = await fetch(
      `${VIPPS_API_URL}/epayment/v1/payments/${reference}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        },
        'Failed to get payment details'
      );
      throw new Error(`Failed to get payment: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as PaymentDetails;

    logger.info(
      {
        reference,
        data,
      },
      'Successfully retrieved payment details'
    );


    return data;
  } catch (error) {
    logger.error(
      {
        error,
        reference,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'Error getting payment details'
    );
    throw error;
  }
}

/**
 * Get payment event log
 * GET /epayment/v1/payments/{reference}/events
 */
export async function getPaymentEvents(reference: string): Promise<PaymentEvent[]> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Getting payment event log');

    const accessToken = await getAccessToken();
    const headers = buildHeaders(accessToken);

    const response = await fetch(
      `${VIPPS_API_URL}/epayment/v1/payments/${reference}/events`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        },
        'Failed to get payment events'
      );
      throw new Error(`Failed to get payment events: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as PaymentEvent[];

    logger.info(
      {
        reference,
        eventCount: data.length,
      },
      'Successfully retrieved payment events'
    );

    return data;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference,
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs: responseTime,
      },
      'Error getting payment events'
    );
    throw error;
  }
}

/**
 * Capture payment (full or partial)
 * POST /epayment/v1/payments/{reference}/capture
 */
export async function capturePayment(
  reference: string,
  captureRequest: CapturePaymentRequest,
  idempotencyKey?: string
): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info(
      {
        reference,
        amount: captureRequest.modificationAmount,
      },
      'Capturing payment'
    );

    const accessToken = await getAccessToken();
    const headers = buildHeaders(accessToken, idempotencyKey);

    const response = await fetch(
      `${VIPPS_API_URL}/epayment/v1/payments/${reference}/capture`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(captureRequest),
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          responseTimeMs: responseTime,
        },
        'Failed to capture payment'
      );
      throw new Error(`Failed to capture payment: ${response.status} - ${errorText}`);
    }

    logger.info(
      {
        reference,
        amount: captureRequest.modificationAmount,
        responseTimeMs: responseTime,
      },
      'Successfully captured payment'
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference,
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs: responseTime,
      },
      'Error capturing payment'
    );
    throw error;
  }
}

/**
 * Cancel payment (full or partial)
 * POST /epayment/v1/payments/{reference}/cancel
 */
export async function cancelPayment(
  reference: string,
  idempotencyKey?: string
): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Cancelling payment');

    const accessToken = await getAccessToken();
    const headers = buildHeaders(accessToken, idempotencyKey);

    const response = await fetch(
      `${VIPPS_API_URL}/epayment/v1/payments/${reference}/cancel`,
      {
        method: 'POST',
        headers,
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          responseTimeMs: responseTime,
        },
        'Failed to cancel payment'
      );
      throw new Error(`Failed to cancel payment: ${response.status} - ${errorText}`);
    }

    logger.info(
      {
        reference,
        responseTimeMs: responseTime,
      },
      'Successfully cancelled payment'
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference,
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs: responseTime,
      },
      'Error cancelling payment'
    );
    throw error;
  }
}

/**
 * Refund payment (full or partial)
 * POST /epayment/v1/payments/{reference}/refund
 */
export async function refundPayment(
  reference: string,
  refundRequest: RefundPaymentRequest,
  idempotencyKey?: string
): Promise<void> {
  try {
    logger.info(
      {
        reference,
        amount: refundRequest.modificationAmount,
      },
      'Refunding payment'
    );

    const accessToken = await getAccessToken();
    const headers = buildHeaders(accessToken, idempotencyKey);

    const response = await fetch(
      `${VIPPS_API_URL}/epayment/v1/payments/${reference}/refund`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(refundRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        },
        'Failed to refund payment'
      );
      throw new Error(`Failed to refund payment: ${response.status} - ${errorText}`);
    }

    logger.info(
      {
        reference,
        amount: refundRequest.modificationAmount,
      },
      'Successfully refunded payment'
    );
  } catch (error) {
    logger.error(
      {
        error,
        reference,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'Error refunding payment'
    );
    throw error;
  }
}
