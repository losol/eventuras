'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { cancelPayment } from '@eventuras/vipps/epayment-v1';

import { getVippsConfig } from '@/lib/vipps/config';
import type { Transaction } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:cancelPayment',
  context: { module: 'cancelPaymentAction' },
});

/**
 * Cancel authorized payment
 *
 * This server action:
 * 1. Validates that order can be cancelled (not shipped/completed)
 * 2. Finds the transaction and payment reference
 * 3. Cancels the payment via Vipps if AUTHORIZED
 * 4. Updates transaction and order status
 * 5. Logs business event with actor
 */
export async function cancelOrderPayment(
  orderId: string,
  actorId?: string,
): Promise<ServerActionResult<void>> {
  try {
    logger.info({ orderId }, 'Starting payment cancellation');

    const payload = await getPayload({ config: configPromise });

    // 1. Get order
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    });

    if (!order) {
      return actionError('Order not found');
    }

    if (order.status === 'completed') {
      return actionError('Cannot cancel payment for completed order');
    }

    if (order.status === 'canceled') {
      return actionError('Order is already canceled');
    }

    logger.info({ orderId, status: order.status }, 'Order retrieved');

    // 2. Find transaction for this order to get payment reference
    const transactions = await payload.find({
      collection: 'transactions',
      where: {
        order: {
          equals: orderId,
        },
      },
      limit: 1,
    });

    if (transactions.docs.length === 0) {
      return actionError('No transaction found for this order');
    }

    const transaction = transactions.docs[0] as Transaction;
    const paymentReference = transaction.paymentReference;

    if (!paymentReference) {
      return actionError('Transaction has no payment reference');
    }

    // 3. Check if payment can be cancelled
    if (transaction.status !== 'authorized') {
      return actionError(
        `Cannot cancel payment with status "${transaction.status}". Only authorized payments can be cancelled.`
      );
    }

    logger.info(
      { orderId, transactionId: transaction.id, paymentReference, status: transaction.status },
      'Found authorized transaction'
    );

    // 4. Cancel payment via Vipps
    try {
      const vippsConfig = getVippsConfig();

      // Generate idempotency key for cancel operation
      const idempotencyKey = `cancel-${orderId}`;

      await cancelPayment(vippsConfig, paymentReference, idempotencyKey);

      logger.info(
        { orderId, transactionId: transaction.id, paymentReference },
        'Payment cancelled successfully via Vipps'
      );
    } catch (error) {
      logger.error(
        { error, orderId, transactionId: transaction.id, paymentReference },
        'Failed to cancel payment via Vipps'
      );
      return actionError(
        error instanceof Error
          ? `Failed to cancel payment: ${error.message}`
          : 'Failed to cancel payment'
      );
    }

    // 5. Update transaction status to 'cancelled'
    await payload.update({
      collection: 'transactions',
      id: transaction.id as string,
      data: {
        status: 'cancelled',
      },
    });

    logger.info({ orderId, transactionId: transaction.id }, 'Transaction marked as cancelled');

    // 6. Update order status to 'canceled'
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'canceled',
      },
    });

    logger.info({ orderId }, 'Order marked as canceled');

    // 7. Create business event for payment cancellation
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'payment.cancelled',
        source: 'internal',
        entity: {
          relationTo: 'orders',
          value: orderId,
        },
        actor: actorId || undefined,
        externalReference: paymentReference,
        data: {
          orderId,
          transactionId: transaction.id,
          paymentReference,
          amount: transaction.amount,
          currency: transaction.currency,
          cancelledAt: new Date().toISOString(),
          cancelledBy: actorId,
        },
      },
    });

    logger.info({ orderId }, 'Business event created for cancellation');

    return actionSuccess(undefined, 'Payment cancelled successfully!');
  } catch (error) {
    logger.error({ error, orderId }, 'Error cancelling payment');
    return actionError(
      error instanceof Error ? error.message : 'Failed to cancel payment'
    );
  }
}
