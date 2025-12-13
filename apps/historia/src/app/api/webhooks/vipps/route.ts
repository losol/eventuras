import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

import { Logger } from '@eventuras/logger';
import {
  getEventType,
  parseWebhookPayload,
  verifyWebhookSignature,
  type WebhookPayload,
} from '@eventuras/vipps/webhooks-v1';

import config from '@/payload.config';

const logger = Logger.create({
  namespace: 'historia:api:webhooks:vipps',
  context: { module: 'VippsWebhookHandler' },
});

/**
 * Valid transaction statuses based on Transactions collection
 */
type TransactionStatus = 'pending' | 'authorized' | 'captured' | 'completed' | 'failed' | 'refunded' | 'partially-refunded';

/**
 * Vipps webhook handler
 *
 * Receives webhook events from Vipps MobilePay and:
 * 1. Verifies HMAC signature
 * 2. Stores event in WebhookEvents collection
 * 3. Processes event (updates Transaction and Order)
 * 4. Returns 200 OK to acknowledge receipt
 *
 * Events handled:
 * - epayments.payment.created.v1
 * - epayments.payment.aborted.v1
 * - epayments.payment.expired.v1
 * - epayments.payment.cancelled.v1
 * - epayments.payment.captured.v1
 * - epayments.payment.refunded.v1
 * - epayments.payment.authorized.v1
 * - epayments.payment.terminated.v1
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Read raw body for signature verification
    const rawBody = await request.text();

    // Get headers for signature verification
    const webhookId = request.headers.get('X-Vipps-Idempotency-Key');
    const xMsDate = request.headers.get('x-ms-date');
    const xMsContentSha256 = request.headers.get('x-ms-content-sha256');
    const host = request.headers.get('host');
    const authorization = request.headers.get('authorization');

    if (!webhookId || !xMsDate || !xMsContentSha256 || !host || !authorization) {
      logger.warn(
        { webhookId, xMsDate, xMsContentSha256, host, authorization: !!authorization },
        'Missing required webhook headers'
      );
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    logger.info({ webhookId, xMsDate }, 'Processing webhook');

    // Verify webhook signature
    const webhookSecret = process.env.VIPPS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('VIPPS_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const isValid = verifyWebhookSignature(
      {
        method: 'POST',
        pathAndQuery: url.pathname + url.search,
        headers: {
          'x-ms-date': xMsDate,
          'x-ms-content-sha256': xMsContentSha256,
          host,
          authorization,
        },
        body: rawBody,
      },
      webhookSecret
    );

    if (!isValid) {
      logger.error({ webhookId, xMsDate }, 'Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    logger.debug({ webhookId }, 'Webhook signature verified');

    // Parse webhook payload
    const payload = parseWebhookPayload(rawBody);
    if (!payload) {
      logger.error({ webhookId, rawBody }, 'Failed to parse webhook payload');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Convert PaymentEventName to WebhookEventType
    const eventType = getEventType(payload);

    logger.info(
      {
        webhookId,
        eventType,
        reference: payload.reference,
        pspReference: payload.pspReference,
        success: payload.success,
        payload, // Log complete payload for debugging
      },
      'Webhook payload parsed'
    );

    // Check for duplicate webhook using externalId (idempotency)
    const payloadInstance = await getPayload({ config });
    const existingEvent = await payloadInstance.find({
      collection: 'business-events',
      where: {
        externalId: {
          equals: webhookId,
        },
      },
      limit: 1,
    });

    if (existingEvent.docs.length > 0) {
      logger.info({ webhookId }, 'Event already processed (duplicate)');
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Store business event in database
    const businessEvent = await payloadInstance.create({
      collection: 'business-events',
      data: {
        eventType,
        source: 'vipps',
        externalReference: payload.reference,
        externalId: webhookId,
        data: JSON.parse(JSON.stringify(payload)),
      },
    });

    logger.info(
      { webhookId, businessEventId: businessEvent.id },
      'Business event stored'
    );

    // Process business event
    try {
      await processPaymentEvent(businessEvent.id, payload);

      logger.info(
        { webhookId, duration: Date.now() - startTime },
        'Webhook processed successfully'
      );
    } catch (error) {
      // Log error but still return 200 to acknowledge receipt
      logger.error(
        { error, webhookId, businessEventId: businessEvent.id },
        'Error processing payment event'
      );

      // Update business event with error
      await payloadInstance.update({
        collection: 'business-events',
        id: businessEvent.id,
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(
      { error, duration: Date.now() - startTime },
      'Unexpected error handling webhook'
    );

    // Return 500 to indicate failure - Vipps will retry
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process payment event and update Transaction and Order
 */
async function processPaymentEvent(businessEventId: string, payload: WebhookPayload) {
  const payloadInstance = await getPayload({ config });

  logger.info(
    { businessEventId, eventType: payload.name, reference: payload.reference },
    'Processing payment event'
  );

  // Find transaction by payment reference
  const transactions = await payloadInstance.find({
    collection: 'transactions',
    where: {
      paymentReference: {
        equals: payload.reference,
      },
    },
    limit: 1,
  });

  if (transactions.docs.length === 0) {
    logger.warn(
      { reference: payload.reference, eventType: payload.name },
      'No transaction found for payment reference'
    );

    // Mark event with error
    await payloadInstance.update({
      collection: 'business-events',
      id: businessEventId,
      data: {
        error: 'No transaction found for payment reference',
      },
    });

    return;
  }

  const transaction = transactions.docs[0];
  logger.debug({ transactionId: transaction.id, eventType: payload.name }, 'Transaction found');

  // Update business event with entity relationship
  await payloadInstance.update({
    collection: 'business-events',
    id: businessEventId,
    data: {
      entity: {
        relationTo: 'transactions',
        value: transaction.id,
      },
    },
  });

  // Map event name to transaction status
  const statusMap: Record<string, string> = {
    'CREATED': 'pending',
    'AUTHORIZED': 'authorized',
    'CAPTURED': 'captured',
    'CANCELLED': 'failed',
    'ABORTED': 'failed',
    'EXPIRED': 'failed',
    'TERMINATED': 'failed',
    'REFUNDED': 'refunded',
  };

  const newStatus = statusMap[payload.name];
  if (!newStatus) {
    logger.warn({ eventType: payload.name }, 'Unknown event type');
    await payloadInstance.update({
      collection: 'business-events',
      id: businessEventId,
      data: {
        error: `Unknown event type: ${payload.name}`,
      },
    });
    return;
  }

  // Update transaction status
  await payloadInstance.update({
    collection: 'transactions',
    id: transaction.id,
    data: {
      status: newStatus as TransactionStatus,
    },
  });

  logger.info(
    { transactionId: transaction.id, oldStatus: transaction.status, newStatus },
    'Transaction status updated'
  );

  // Trigger revalidation for SSE endpoints and pages
  // This ensures real-time updates reach connected clients
  // Note: revalidatePath in API routes has limited effect, SSE polling is the primary mechanism
  logger.debug({ reference: payload.reference }, 'Transaction updated, SSE will detect change');

  // Update order status based on transaction status
  await updateOrderStatus(transaction, newStatus as TransactionStatus, payload);

  logger.info({ businessEventId }, 'Payment event processed successfully');
}

/**
 * Update order status based on transaction status
 * Maps transaction states to appropriate order states
 */
async function updateOrderStatus(
  transaction: any,
  transactionStatus: TransactionStatus,
  vippsPayload?: WebhookPayload
) {
  // Skip if transaction has no associated order
  if (!transaction.order) {
    logger.warn(
      { transactionId: transaction.id, status: transactionStatus },
      'Transaction has no associated order, skipping order update'
    );
    return;
  }

  const orderId = typeof transaction.order === 'string' ? transaction.order : transaction.order.id;

  logger.debug(
    { orderId, transactionId: transaction.id, transactionStatus },
    'Updating order status based on transaction'
  );

  // Map transaction status to order status
  const orderStatusMap: Record<TransactionStatus, string> = {
    'pending': 'pending',           // Payment initiated, waiting for user action
    'authorized': 'processing',     // Payment authorized, ready to be captured
    'captured': 'completed',        // Payment captured, order can be fulfilled
    'completed': 'completed',       // Payment completed (same as captured)
    'failed': 'canceled',           // Payment failed or cancelled
    'refunded': 'canceled',         // Payment refunded, treat as cancelled
    'partially-refunded': 'completed', // Partial refund doesn't cancel the order
  };

  const newOrderStatus = orderStatusMap[transactionStatus];

  if (!newOrderStatus) {
    logger.warn(
      { transactionStatus, orderId },
      'Unknown transaction status, cannot map to order status'
    );
    return;
  }

  try {
    const payloadInstance = await getPayload({ config });

    // Get current order to check status
    const order = await payloadInstance.findByID({
      collection: 'orders',
      id: orderId,
    });

    // Only update if status is different
    if (order.status === newOrderStatus) {
      logger.debug(
        { orderId, status: newOrderStatus },
        'Order status already set, skipping update'
      );
      return;
    }

    await payloadInstance.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: newOrderStatus,
      },
    });

    // Create business event for order status change
    await payloadInstance.create({
      collection: 'business-events',
      data: {
        eventType: `order.status.${newOrderStatus}`,
        source: 'system',
        externalReference: orderId,
        entity: {
          relationTo: 'orders',
          value: orderId,
        },
        data: {
          orderId,
          transactionId: transaction.id,
          oldStatus: order.status,
          newStatus: newOrderStatus,
          transactionStatus,
          triggeredBy: 'vipps-webhook',
          vippsPayload: vippsPayload ? JSON.parse(JSON.stringify(vippsPayload)) : undefined,
        },
      },
    });

    logger.info(
      {
        orderId,
        transactionId: transaction.id,
        oldStatus: order.status,
        newStatus: newOrderStatus,
        transactionStatus,
      },
      'Order status updated based on transaction status'
    );
  } catch (error) {
    logger.error(
      {
        error,
        orderId,
        transactionId: transaction.id,
        transactionStatus,
      },
      'Failed to update order status'
    );
    // Don't throw - we've already processed the transaction update successfully
  }
}
