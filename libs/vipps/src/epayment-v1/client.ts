/**
 * Vipps MobilePay ePayment API v1 Client
 *
 * Client for interacting with the Vipps MobilePay ePayment API.
 * https://developer.vippsmobilepay.com/docs/APIs/epayment-api/
 */

import { Logger } from '@eventuras/logger';

import type { VippsConfig } from '../vipps-core';
import { buildHeaders, getAccessToken } from '../vipps-core';

import type {
  CapturePaymentRequest,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentDetails,
  PaymentEvent,
  RefundPaymentRequest,
} from './types';

const logger = Logger.create({
  namespace: 'eventuras:vipps',
  context: { module: 'epaymentClient' },
});

/**
 * Create a new payment
 * POST /epayment/v1/payments
 */
export async function createPayment(
  config: VippsConfig,
  request: CreatePaymentRequest,
  idempotencyKey?: string
): Promise<CreatePaymentResponse> {
  const startTime = Date.now();

  try {
    logger.info(
      {
        reference: request.reference,
        amount: request.amount,
        userFlow: request.userFlow,
      },
      'Creating Vipps ePayment'
    );

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken, idempotencyKey || request.reference);

    const response = await fetch(`${config.apiUrl}/epayment/v1/payments`, {
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
export async function getPaymentDetails(
  config: VippsConfig,
  reference: string
): Promise<PaymentDetails> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Getting payment details');

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken);

    const response = await fetch(`${config.apiUrl}/epayment/v1/payments/${reference}`, {
      method: 'GET',
      headers,
    });

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
        'Failed to get payment details'
      );
      throw new Error(`Failed to get payment: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as PaymentDetails;

    logger.info(
      {
        reference,
        state: data.state,
        responseTimeMs: responseTime,
      },
      'Successfully retrieved payment details'
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
      'Error getting payment details'
    );
    throw error;
  }
}

/**
 * Capture payment (full or partial)
 * POST /epayment/v1/payments/{reference}/capture
 */
export async function capturePayment(
  config: VippsConfig,
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

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken, idempotencyKey);

    const response = await fetch(`${config.apiUrl}/epayment/v1/payments/${reference}/capture`, {
      method: 'POST',
      headers,
      body: JSON.stringify(captureRequest),
    });

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
  config: VippsConfig,
  reference: string,
  idempotencyKey?: string
): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Cancelling payment');

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken, idempotencyKey);

    const response = await fetch(`${config.apiUrl}/epayment/v1/payments/${reference}/cancel`, {
      method: 'POST',
      headers,
    });

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
  config: VippsConfig,
  reference: string,
  refundRequest: RefundPaymentRequest,
  idempotencyKey?: string
): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info(
      {
        reference,
        amount: refundRequest.modificationAmount,
      },
      'Refunding payment'
    );

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken, idempotencyKey);

    const response = await fetch(`${config.apiUrl}/epayment/v1/payments/${reference}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify(refundRequest),
    });

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
        'Failed to refund payment'
      );
      throw new Error(`Failed to refund payment: ${response.status} - ${errorText}`);
    }

    logger.info(
      {
        reference,
        amount: refundRequest.modificationAmount,
        responseTimeMs: responseTime,
      },
      'Successfully refunded payment'
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
      'Error refunding payment'
    );
    throw error;
  }
}

/**
 * Get payment event log
 * GET /epayment/v1/payments/{reference}/events
 *
 * Returns the authoritative history of all events for a payment.
 * This includes all operations like CREATED, AUTHORIZED, CAPTURED, etc.
 *
 * @param config - Vipps configuration
 * @param reference - Payment reference
 * @returns Array of payment events in chronological order
 *
 * @see https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/operations/get_event_log/
 */
export async function getPaymentEvents(
  config: VippsConfig,
  reference: string
): Promise<PaymentEvent[]> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Getting payment event log');

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken);

    const response = await fetch(`${config.apiUrl}/epayment/v1/payments/${reference}/events`, {
      method: 'GET',
      headers,
    });

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
        'Failed to get payment events'
      );
      throw new Error(`Failed to get payment events: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as PaymentEvent[];

    logger.info(
      {
        reference,
        eventCount: data.length,
        events: data.map((e) => e.name),
        responseTimeMs: responseTime,
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
 * Force approve a payment (TEST ENVIRONMENT ONLY)
 * POST /epayment/v1/test/payments/{reference}/approve
 *
 * This endpoint simplifies automated testing by confirming payments without the test app.
 *
 * **IMPORTANT REQUIREMENTS:**
 * - Only available in test environment
 * - Test user must have manually approved at least one payment in the app first
 * - Express checkout is not supported
 * - Will fail if used in production
 *
 * **NOTE:** You may get HTTP 500 for expired card - create a new test user if this happens.
 *
 * @param config - Vipps configuration (must use test API URL)
 * @param reference - Payment reference
 * @param customerPhoneNumber - Phone number of the test user
 * @param idempotencyKey - Optional idempotency key
 *
 * @see https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/operations/force-approve/
 */
export async function forceApprovePayment(
  config: VippsConfig,
  reference: string,
  customerPhoneNumber: string,
  idempotencyKey?: string
): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info(
      {
        reference,
        phoneNumber: customerPhoneNumber,
      },
      'Force approving payment (TEST ONLY)'
    );

    const accessToken = await getAccessToken(config);
    const headers = buildHeaders(config, accessToken, idempotencyKey);

    const response = await fetch(`${config.apiUrl}/epayment/v1/test/payments/${reference}/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customer: { phoneNumber: customerPhoneNumber } }),
    });

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
        'Failed to force approve payment'
      );
      throw new Error(`Failed to force approve payment: ${response.status} - ${errorText}`);
    }

    logger.info(
      {
        reference,
        responseTimeMs: responseTime,
      },
      'Successfully force approved payment'
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
      'Error force approving payment'
    );
    throw error;
  }
}

