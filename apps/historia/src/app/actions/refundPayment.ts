'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { refundPayment } from '@eventuras/vipps/epayment-v1';

import { getVippsConfig } from '@/lib/vipps/config';
import type { Transaction } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:refundPayment',
  context: { module: 'refundPaymentAction' },
});

/**
 * Refund captured payment
 *
 * This server action:
 * 1. Validates that order can be refunded (completed with captured payment)
 * 2. Finds the transaction and payment reference
 * 3. Refunds the payment via Vipps if CAPTURED
 * 4. Updates transaction status
 * 5. Logs business event with actor
 */
export async function refundOrderPayment(
  orderId: string,
  actorId?: string,
): Promise<ServerActionResult<void>> {
  try {
    logger.info({ orderId }, 'Starting payment refund');

    const payload = await getPayload({ config: configPromise });

    // 1. Get order
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    });

    if (!order) {
      return actionError('Order not found');
    }

    if (order.status !== 'completed') {
      return actionError('Can only refund completed orders');
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

    // 3. Check if payment can be refunded
    if (transaction.status !== 'captured') {
      return actionError(
        `Cannot refund payment with status "${transaction.status}". Only captured payments can be refunded.`
      );
    }

    logger.info(
      { orderId, transactionId: transaction.id, paymentReference, status: transaction.status },
      'Found captured transaction'
    );

    // 4. Refund payment via Vipps
    try {
      const vippsConfig = getVippsConfig();

      // Validate currency before making the API call
      const supportedCurrencies = ['NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK'] as const;
      if (!supportedCurrencies.includes(transaction.currency as typeof supportedCurrencies[number])) {
        logger.error(
          { orderId, transactionId: transaction.id, paymentReference, currency: transaction.currency },
          `Unsupported currency "${transaction.currency}" for refund.`
        );
        return actionError(
          `Cannot refund payment: Unsupported currency "${transaction.currency}". Supported currencies are: ${supportedCurrencies.join(', ')}.`
        );
      }

      // Generate idempotency key for refund operation
      const idempotencyKey = `refund-${orderId}`;

      await refundPayment(
        vippsConfig,
        paymentReference,
        {
          modificationAmount: {
            value: transaction.amount,
            currency: transaction.currency as typeof supportedCurrencies[number],
          },
        },
        idempotencyKey
      );

      logger.info(
        { orderId, transactionId: transaction.id, paymentReference, amount: transaction.amount },
        'Payment refunded successfully via Vipps'
      );
    } catch (error) {
      logger.error(
        { error, orderId, transactionId: transaction.id, paymentReference },
        'Failed to refund payment via Vipps'
      );
      return actionError(
        error instanceof Error
          ? `Failed to refund payment: ${error.message}`
          : 'Failed to refund payment'
      );
    }

    // 5. Update transaction status to 'refunded'
    await payload.update({
      collection: 'transactions',
      id: transaction.id as string,
      data: {
        status: 'refunded',
      },
    });

    logger.info({ orderId, transactionId: transaction.id }, 'Transaction marked as refunded');

    // 6. Create business event for payment refund
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'payment.refunded',
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
          refundedAt: new Date().toISOString(),
          refundedBy: actorId,
        },
      },
    });

    logger.info({ orderId }, 'Business event created for refund');

    return actionSuccess(undefined, 'Payment refunded successfully!');
  } catch (error) {
    logger.error({ error, orderId }, 'Error refunding payment');
    return actionError(
      error instanceof Error ? error.message : 'Failed to refund payment'
    );
  }
}
