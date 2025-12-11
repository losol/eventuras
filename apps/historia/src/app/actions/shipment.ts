'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { capturePayment } from '@eventuras/vipps/epayment-v1';

import { getVippsConfig } from '@/lib/vipps/config';
import type { Transaction } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:shipment',
  context: { module: 'shipmentActions' },
});

/**
 * Ship complete order and capture payment
 *
 * This server action:
 * 1. Creates a full shipment with all order items
 * 2. Finds the transaction and payment reference
 * 3. Captures the payment via Vipps if AUTHORIZED
 * 4. Updates order status to 'completed'
 */
export async function shipCompleteOrderAndCapture(
  orderId: string,
): Promise<ServerActionResult<{ shipmentId: string }>> {
  try {
    logger.info({ orderId }, 'Starting ship complete order and capture');

    const payload = await getPayload({ config: configPromise });

    // 1. Get order with items
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    });

    if (!order) {
      return actionError('Order not found');
    }

    if (order.status === 'completed') {
      return actionError('Order is already completed');
    }

    if (order.status === 'canceled') {
      return actionError('Cannot ship a canceled order');
    }

    if (!order.items || order.items.length === 0) {
      return actionError('Order has no items to ship');
    }

    logger.info(
      { orderId, itemCount: order.items.length, status: order.status },
      'Order retrieved'
    );

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

    logger.info(
      { orderId, transactionId: transaction.id, paymentReference },
      'Found transaction with payment reference'
    );

    // 3. Capture payment via Vipps if status is 'authorized'
    if (transaction.status === 'authorized') {
      try {
        const vippsConfig = getVippsConfig();

        // Validate currency before making the API call
        const supportedCurrencies = ['NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK'] as const;
        if (!supportedCurrencies.includes(transaction.currency as typeof supportedCurrencies[number])) {
          logger.error(
            { orderId, transactionId: transaction.id, paymentReference, currency: transaction.currency },
            `Unsupported currency "${transaction.currency}" for capture.`
          );
          return actionError(
            `Cannot capture payment: Unsupported currency "${transaction.currency}". Supported currencies are: ${supportedCurrencies.join(', ')}.`
          );
        }

        // Generate idempotency key for capture operation
        // Uses orderId to ensure same capture attempt gets same key (idempotency)
        const idempotencyKey = `capture-${orderId}`;

        // Capture the full authorized amount
        await capturePayment(
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

        // Update transaction status to 'captured'
        await payload.update({
          collection: 'transactions',
          id: transaction.id as string,
          data: {
            status: 'captured',
          },
        });

        logger.info(
          { orderId, transactionId: transaction.id, paymentReference, amount: transaction.amount },
          'Payment captured successfully'
        );
      } catch (error) {
        logger.error(
          { error, orderId, transactionId: transaction.id, paymentReference },
          'Failed to capture payment'
        );
        return actionError(
          error instanceof Error
            ? `Failed to capture payment: ${error.message}`
            : 'Failed to capture payment'
        );
      }
    } else if (transaction.status === 'captured') {
      logger.info(
        { orderId, transactionId: transaction.id },
        'Payment already captured'
      );
    } else {
      logger.error(
        { orderId, transactionId: transaction.id, status: transaction.status },
        'Transaction status is not authorized or captured'
      );
      return actionError(
        `Cannot create shipment: transaction status is '${transaction.status}', expected 'authorized' or 'captured'.`
      );
    }

    // 4. Create shipment with all order items
    const shipmentItems = order.items.map((item) => ({
      orderItemId: item.itemId,
      product: typeof item.product === 'string' ? item.product : item.product.id,
      quantity: item.quantity,
    }));

    const shipment = await payload.create({
      collection: 'shipments',
      data: {
        tenant: typeof order.tenant === 'string' ? order.tenant : order.tenant?.id,
        order: orderId,
        items: shipmentItems,
        status: 'shipped',
        shipmentType: 'full',
        shippingAddress: order.shippingAddress,
        shippedAt: new Date().toISOString(),
      },
    });

    logger.info(
      { orderId, shipmentId: shipment.id, itemCount: shipmentItems.length },
      'Shipment created'
    );

    // 5. Update order status to 'completed'
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'completed',
      },
    });

    logger.info({ orderId, shipmentId: shipment.id }, 'Order marked as completed');

    // 6. Create business event for order shipment
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'order.shipped',
        source: 'internal',
        entity: {
          relationTo: 'orders',
          value: orderId,
        },
        externalReference: paymentReference,
        data: {
          orderId,
          shipmentId: shipment.id,
          transactionId: transaction.id,
          paymentReference,
          amount: transaction.amount,
          currency: transaction.currency,
          capturedAt: new Date().toISOString(),
        },
      },
    });

    logger.info({ orderId, shipmentId: shipment.id }, 'Business event created');

    return actionSuccess(
      { shipmentId: shipment.id as string },
      'Order shipped and payment captured successfully!'
    );
  } catch (error) {
    logger.error({ error, orderId }, 'Error shipping order and capturing payment');
    return actionError(
      error instanceof Error ? error.message : 'Failed to ship order and capture payment'
    );
  }
}
