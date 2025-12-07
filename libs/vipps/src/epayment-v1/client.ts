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
 * Get payment event log
 * GET /epayment/v1/payments/{reference}/events
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
