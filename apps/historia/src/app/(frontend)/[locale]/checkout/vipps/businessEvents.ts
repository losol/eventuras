'use server';

import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import config from '@/payload.config';

const logger = Logger.create({
  namespace: 'historia:checkout:vipps',
  context: { module: 'businessEvents' },
});

/**
 * Create a business event for a failed payment
 *
 * @param reference - Payment reference from Vipps
 * @param failureReason - Reason for payment failure (aborted, expired, terminated)
 * @param paymentDetails - Optional additional payment details from Vipps API
 * @returns Success or error result
 */
export async function createPaymentFailureEvent(
  reference: string,
  failureReason: string,
  paymentDetails?: Record<string, unknown>
): Promise<ServerActionResult<void>> {
  try {
    logger.info(
      { reference, failureReason },
      'Creating business event for failed payment'
    );

    const payload = await getPayload({ config });

    // Create business event
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'payment.failed',
        source: 'vipps',
        externalReference: reference,
        data: {
          reference,
          failureReason,
          timestamp: new Date().toISOString(),
          paymentDetails: paymentDetails || {},
        },
      },
    });

    logger.info(
      { reference, failureReason },
      'Business event created for failed payment'
    );

    return actionSuccess(undefined);
  } catch (error) {
    logger.error(
      { reference, failureReason, error },
      'Failed to create business event for failed payment'
    );

    return actionError(
      error instanceof Error ? error.message : 'Failed to create business event'
    );
  }
}

/**
 * Create a business event for automatic order creation
 * Used to track when webhook or callback successfully creates an order
 *
 * @param reference - Payment reference from Vipps
 * @param orderId - The created order ID
 * @param amount - Payment amount
 * @param source - Whether order was created by webhook or callback
 * @returns Success or error result
 */
export async function createOrderAutoCreatedEvent(
  reference: string,
  orderId: string,
  amount: { value: number; currency: string },
  source: 'webhook' | 'callback'
): Promise<ServerActionResult<void>> {
  try {
    logger.info(
      { reference, orderId, source },
      `Creating business event for order auto-created by ${source}`
    );

    const payload = await getPayload({ config });

    // Create business event
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'order.auto_created',
        source: source === 'webhook' ? 'vipps_webhook' : 'vipps_callback',
        externalReference: reference,
        data: {
          reference,
          orderId,
          amount,
          source,
          timestamp: new Date().toISOString(),
        },
      },
    });

    logger.info(
      { reference, orderId, source },
      `Business event created for order auto-created by ${source}`
    );

    return actionSuccess(undefined);
  } catch (error) {
    logger.error(
      { reference, orderId, source, error },
      'Failed to create business event for order auto-creation'
    );

    return actionError(
      error instanceof Error ? error.message : 'Failed to create business event'
    );
  }
}
