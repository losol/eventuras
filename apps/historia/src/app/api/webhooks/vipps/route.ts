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
 * 1. Verifies HMAC signature using x-ms-date, x-ms-content-sha256, host, and authorization headers
 * 2. Stores event in business-events collection
 * 3. Processes event (updates Transaction and Order)
 * 4. Returns 200 OK to acknowledge receipt
 *
 * Uses idempotencyKey from payload when available, with fallback to pspReference combined
 * with eventType to ensure uniqueness across different event types for the same payment.
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
    const xMsDate = request.headers.get('x-ms-date');
    const xMsContentSha256 = request.headers.get('x-ms-content-sha256');
    const host = request.headers.get('host');
    const authorization = request.headers.get('authorization');

    if (!xMsDate || !xMsContentSha256 || !host || !authorization) {
      logger.warn(
        { xMsDate, xMsContentSha256, host, authorization: !!authorization },
        'Missing required webhook headers'
      );
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    logger.info({ xMsDate }, 'Processing webhook');

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
      logger.error({ xMsDate }, 'Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    logger.debug('Webhook signature verified');

    // Parse webhook payload
    const payload = parseWebhookPayload(rawBody);
    if (!payload) {
      logger.error({
        rawBody: rawBody.substring(0, 500),  // Log first 500 chars to avoid huge logs
        bodyLength: rawBody.length,
        xMsDate,
        host,
      }, 'CRITICAL: Failed to parse webhook payload - invalid JSON or structure');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Convert PaymentEventName to WebhookEventType
    const eventType = getEventType(payload);

    // Use idempotencyKey when available, with a composite fallback to ensure uniqueness across event types
    const eventId =
      payload.idempotencyKey ??
      (payload.pspReference && eventType
        ? `${payload.pspReference}-${eventType}`
        : payload.pspReference);

    logger.info(
      {
        eventId,
        eventType,
        reference: payload.reference,
        pspReference: payload.pspReference,
        success: payload.success,
      },
      'Webhook payload parsed'
    );

    // Check for duplicate webhook using externalId (idempotency)
    const payloadInstance = await getPayload({ config });
    const existingEvent = await payloadInstance.find({
      collection: 'business-events',
      where: {
        externalId: {
          equals: eventId,
        },
      },
      limit: 1,
    });

    if (existingEvent.docs.length > 0) {
      logger.info({ eventId }, 'Event already processed (duplicate)');
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Store business event in database
    const businessEvent = await payloadInstance.create({
      collection: 'business-events',
      data: {
        eventType,
        source: 'vipps',
        externalReference: payload.reference,
        externalId: eventId,
        data: JSON.parse(JSON.stringify(payload)),
      },
    });

    logger.info(
      { eventId, businessEventId: businessEvent.id },
      'Business event stored'
    );

    // Process business event
    try {
      await processPaymentEvent(businessEvent.id, payload);

      logger.info(
        { eventId, duration: Date.now() - startTime },
        'Webhook processed successfully'
      );
    } catch (error) {
      // Log error but still return 200 to acknowledge receipt
      logger.error(
        {
          error,
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          eventId,
          businessEventId: businessEvent.id,
          payloadReference: payload.reference,
          payloadEventType: payload.name,
          payloadAmount: payload.amount,
          payloadPspReference: payload.pspReference,
        },
        'Error processing payment event - business event stored but processing failed'
      );

      // Update business event with detailed error information
      await payloadInstance.update({
        collection: 'business-events',
        id: businessEvent.id,
        data: {
          error: error instanceof Error
            ? `${error.name}: ${error.message}\n${error.stack || ''}`
            : String(error),
        },
      });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(
      {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
        headers: {
          xMsDate: request.headers.get('x-ms-date'),
          hasAuth: !!request.headers.get('authorization'),
          hasContentHash: !!request.headers.get('x-ms-content-sha256'),
        },
      },
      'CRITICAL: Unexpected error handling webhook - Vipps will retry'
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
    // CRITICAL: No transaction found - this could be an orphaned payment!
    // This happens when user completed payment in Vipps but the session flow failed
    // (e.g., cross-domain issues, browser closed, network error)

    logger.error(
      {
        reference: payload.reference,
        eventType: payload.name,
        pspReference: payload.pspReference,
        amount: payload.amount,
        businessEventId,
      },
      'WEBHOOK DETECTED ORPHANED PAYMENT: No transaction found for payment reference'
    );

    // Only handle AUTHORIZED and CAPTURED events (successful payments)
    if (payload.name === 'AUTHORIZED' || payload.name === 'CAPTURED') {
      logger.warn(
        {
          reference: payload.reference,
          eventType: payload.name,
          amount: payload.amount,
          pspReference: payload.pspReference,
          businessEventId,
        },
        'Payment authorized/captured but no transaction exists yet. Business event stored for SSE detection.'
      );

      // NOTE: We do NOT attempt order creation here because:
      // 1. Webhook context has no access to user session → cannot read cart
      // 2. SSE endpoint polls business-events and will trigger order creation
      // 3. SSE runs in user's session context → has cart access
      //
      // This is normal when webhook arrives before user returns from Vipps.
      // The SSE-based recovery will handle this case automatically.

      return; // Event stored, SSE will handle order creation
    } else {
      // For non-success events (ABORTED, EXPIRED, etc.), just log as warning
      logger.warn(
        { reference: payload.reference, eventType: payload.name, businessEventId },
        'No transaction found for payment reference (non-success event)'
      );

      await payloadInstance.update({
        collection: 'business-events',
        id: businessEventId,
        data: {
          error: 'No transaction found for payment reference',
        },
      });
    }

    return;
  }

  const transaction = transactions.docs[0];
  logger.info(
    {
      transactionId: transaction.id,
      eventType: payload.name,
      oldStatus: transaction.status,
      paymentReference: payload.reference,
      businessEventId,
    },
    'Transaction found, updating status'
  );

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
    logger.error(
      {
        eventType: payload.name,
        reference: payload.reference,
        transactionId: transaction.id,
        businessEventId,
        availableStatuses: Object.keys(statusMap),
        payloadAmount: payload.amount,
        payloadSuccess: payload.success,
      },
      'CRITICAL: Unknown event type - cannot map to transaction status'
    );
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
    {
      transactionId: transaction.id,
      orderId: transaction.order,
      oldStatus: transaction.status,
      newStatus,
      eventType: payload.name,
      reference: payload.reference,
      businessEventId,
    },
    'Transaction status updated successfully'
  );

  // Trigger revalidation for SSE endpoints and pages
  // This ensures real-time updates reach connected clients
  // Note: revalidatePath in API routes has limited effect, SSE polling is the primary mechanism
  logger.debug({ reference: payload.reference }, 'Transaction updated, SSE will detect change');

  // Update order status based on transaction status
  await updateOrderStatus(transaction, newStatus as TransactionStatus, payload);

  logger.info(
    {
      businessEventId,
      transactionId: transaction.id,
      orderId: transaction.order,
      reference: payload.reference,
      eventType: payload.name,
    },
    'Payment event processed successfully'
  );
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
      {
        transactionId: transaction.id,
        status: transactionStatus,
        reference: vippsPayload?.reference,
      },
      'Transaction has no associated order, skipping order update'
    );
    return;
  }

  const orderId = typeof transaction.order === 'string' ? transaction.order : transaction.order.id;

  logger.info(
    {
      orderId,
      transactionId: transaction.id,
      transactionStatus,
      reference: vippsPayload?.reference,
    },
    'Starting order status update based on transaction'
  );

  // Map transaction status to order status
  type OrderStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'canceled';
  const orderStatusMap: Record<TransactionStatus, OrderStatus> = {
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
    logger.error(
      {
        transactionStatus,
        orderId,
        transactionId: transaction.id,
        reference: vippsPayload?.reference,
        availableStatuses: Object.keys(orderStatusMap),
        vippsEventType: vippsPayload?.name,
      },
      'CRITICAL: Unknown transaction status, cannot map to order status'
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

    // Skip if order already has the correct status
    if (order.status === newOrderStatus) {
      logger.debug(
        { orderId, status: newOrderStatus },
        'Order status already set, skipping update'
      );
      return;
    }

    logger.info(
      {
        orderId,
        transactionId: transaction.id,
        oldStatus: order.status,
        newStatus: newOrderStatus,
        transactionStatus,
        reference: vippsPayload?.reference,
      },
      'Updating order status'
    );

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
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        orderId,
        transactionId: transaction.id,
        transactionStatus,
        newOrderStatus,
        vippsReference: vippsPayload?.reference,
        vippsEventType: vippsPayload?.name,
      },
      'CRITICAL: Failed to update order status - transaction updated but order status not synced'
    );
    // Don't throw - we've already processed the transaction update successfully
  }
}
