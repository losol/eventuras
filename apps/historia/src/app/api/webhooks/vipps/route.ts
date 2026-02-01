import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

import { Logger } from '@eventuras/logger';
import { getPaymentDetails } from '@eventuras/vipps/epayment-v1';
import {
  getEventType,
  parseWebhookPayload,
  verifyWebhookSignature,
  type WebhookPayload,
} from '@eventuras/vipps/webhooks-v1';

import { getVippsConfig } from '@/lib/vipps/config';
import config from '@/payload.config';
import type { Transaction } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:api:webhooks:vipps',
  context: { module: 'VippsWebhookHandler' },
});

/**
 * Valid transaction statuses based on Transactions collection
 */
type TransactionStatus = 'pending' | 'authorized' | 'captured' | 'completed' | 'failed' | 'refunded' | 'partially-refunded';

/**
 * Update user with verified data from Vipps
 *
 * Per ADR 0004, Vipps is a trusted identity provider with highest data authority.
 * This function:
 * 1. Updates user fields with Vipps data
 * 2. Sets verification flags to true
 * 3. Creates business event for audit trail
 *
 * @param payload - Payload instance
 * @param userId - User ID to update
 * @param vippsData - Verified data from Vipps
 */
async function updateUserFromVipps(
  payload: Awaited<ReturnType<typeof getPayload>>,
  userId: string,
  vippsData: {
    given_name?: string;
    middle_name?: string;
    family_name?: string;
    email?: string;
    phone_number?: string;
  }
): Promise<void> {
  try {
    // Build update object with only fields that Vipps actually provided
    const updateData: Record<string, any> = {};

    // Update name fields if provided (treated as atomic unit per ADR 0002)
    if (vippsData.given_name || vippsData.family_name) {
      if (vippsData.given_name) updateData.given_name = vippsData.given_name;
      updateData.middle_name = vippsData.middle_name || null;
      if (vippsData.family_name) updateData.family_name = vippsData.family_name;
      updateData.name_verified = true;
    }

    // Update email if provided
    if (vippsData.email) {
      updateData.email = vippsData.email;
      updateData.email_verified = true;
    }

    // Update phone if provided
    if (vippsData.phone_number) {
      updateData.phone_number = vippsData.phone_number;
      updateData.phone_number_verified = true;
    }

    // Only update if we have data to update
    if (Object.keys(updateData).length === 0) {
      return;
    }

    // Update user data with Vipps verified information
    await payload.update({
      collection: 'users',
      id: userId,
      data: updateData,
      overrideAccess: true, // Required to bypass field-level access control per ADR 0003
    });

    // Create business event for audit trail (required per ADR 0002)
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'user.verified',
        source: 'vipps',
        entity: {
          relationTo: 'users',
          value: userId,
        },
        data: {
          verified_fields: ['name', 'email', 'phone_number'],
          vipps_data: {
            given_name: vippsData.given_name,
            middle_name: vippsData.middle_name,
            family_name: vippsData.family_name,
            email: vippsData.email,
            phone_number: vippsData.phone_number,
          },
        },
      },
    });

    logger.info(
      { userId, verifiedFields: ['name', 'email', 'phone_number'] },
      'Updated user with verified Vipps data'
    );
  } catch (error) {
    logger.error(
      { error, userId, vippsData },
      'Failed to update user with Vipps data'
    );
    throw error;
  }
}

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

  // Log all incoming webhook requests at the very start
  logger.info('Webhook request received');
  try {
    // Log all headers FIRST - before reading body or any validation
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });

    const url = new URL(request.url);

    // Extract and log only safe headers (proxy and host information)
    const safeHeaders = {
      // Proxy headers
      'x-forwarded-for': allHeaders['x-forwarded-for'],
      'x-forwarded-host': allHeaders['x-forwarded-host'],
      'x-forwarded-proto': allHeaders['x-forwarded-proto'],
      'x-forwarded-path': allHeaders['x-forwarded-path'],
      'x-original-url': allHeaders['x-original-url'],
      'x-real-ip': allHeaders['x-real-ip'],

      // Azure-specific headers
      'x-azure-clientip': allHeaders['x-azure-clientip'],
      'x-azure-socketip': allHeaders['x-azure-socketip'],

      // Request metadata
      'host': allHeaders['host'],
      'user-agent': allHeaders['user-agent'],
      'referer': allHeaders['referer'],
      'content-type': allHeaders['content-type'],
      'content-length': allHeaders['content-length'],

      // Vipps webhook headers (non-sensitive)
      'x-ms-date': allHeaders['x-ms-date'],
      'x-ms-content-sha256': allHeaders['x-ms-content-sha256'],
    };

    // Extract request origin information
    // When behind Azure App Service proxy, use X-Forwarded-* headers to get real client info
    const requestOrigin = {
      // Client IP addresses - check proxy headers first
      forwardedFor: allHeaders['x-forwarded-for'] || 'none',
      forwardedProto: allHeaders['x-forwarded-proto'] || 'none',
      forwardedHost: allHeaders['x-forwarded-host'] || 'none',
      originalUrl: allHeaders['x-original-url'] || 'none',

      // Azure-specific headers
      azureClientIp: allHeaders['x-azure-clientip'] || 'none',
      azureSocketIp: allHeaders['x-azure-socketip'] || 'none',

      // Request details
      // Use X-Forwarded-Host if available (real domain behind proxy), otherwise fall back to Host header
      host: allHeaders['x-forwarded-host'] || request.headers.get('host') || 'unknown',
      actualHostHeader: request.headers.get('host') || 'unknown',
      userAgent: allHeaders['user-agent'] || 'none',
      referer: allHeaders['referer'] || 'none',

      // Request URL
      fullUrl: request.url,
      pathname: url.pathname,
      search: url.search,
    };

    logger.info(
      {
        requestOrigin,
        method: request.method,
        safeHeaders,
        allHeaderKeys: Object.keys(allHeaders),
      },
      'Incoming Vipps webhook request - full details'
    );

    // Read raw body for signature verification
    const rawBody = await request.text();

    logger.info(
      {
        bodyLength: rawBody.length,
        bodyPreview: rawBody.substring(0, 500), // Increased from 200 to see more
        fullBody: rawBody, // Log complete payload for debugging
        isEmptyBody: rawBody.length === 0,
      },
      'Vipps webhook body received'
    );

    // Get headers for signature verification
    const xMsDate = request.headers.get('x-ms-date');
    const xMsContentSha256 = request.headers.get('x-ms-content-sha256');
    const host = request.headers.get('host');
    const authorization = request.headers.get('authorization');

    if (!xMsDate || !xMsContentSha256 || !host || !authorization) {
      logger.warn(
        {
          xMsDate,
          xMsContentSha256,
          host,
          authorization: !!authorization,
          allHeaderKeys: Object.keys(allHeaders),
        },
        'Missing required webhook headers'
      );
      return NextResponse.json(
        { error: 'Missing required headers', required: ['x-ms-date', 'x-ms-content-sha256', 'host', 'authorization'] },
        { status: 400 }
      );
    }

    logger.info({ xMsDate }, 'Processing webhook - validating signature');

    // Verify webhook signature
    // See: https://developer.vippsmobilepay.com/docs/APIs/webhooks-api/request-authentication/
    const webhookSecret = process.env.VIPPS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('VIPPS_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

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
      logger.error(
        {
          xMsDate,
          host,
          pathAndQuery: url.pathname + url.search,
          contentSha256: xMsContentSha256,
          authHeader: authorization?.substring(0, 50) + '...', // Log first 50 chars only
          bodyLength: rawBody.length,
          expectedSignatureFormat: 'HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=...',
        },
        'Invalid webhook signature - HMAC verification failed. Check VIPPS_WEBHOOK_SECRET matches registration.'
      );
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    logger.info('Webhook signature verified successfully');

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
          webhookUrl: url.toString(),
          webhookHost: host,
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
        webhookUrl: request.headers.get('host')
          ? `https://${request.headers.get('host')}${new URL(request.url).pathname}`
          : request.url,
        webhookHost: request.headers.get('host'),
        webhookPath: new URL(request.url).pathname,
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
 * GET handler for webhook verification
 * Some webhook systems send GET requests to verify endpoint availability
 */
export async function GET(request: NextRequest) {
  logger.info('Webhook verification request received (GET)');

  return NextResponse.json({
    status: 'ok',
    endpoint: 'vipps-webhook',
    message: 'Webhook endpoint is active and ready to receive POST requests',
  });
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

  // If no transaction exists, create one (orphaned payment scenario)
  let transaction;
  if (transactions.docs.length === 0) {
    logger.info(
      {
        reference: payload.reference,
        eventType: payload.name,
        pspReference: payload.pspReference,
        amount: payload.amount,
        businessEventId,
      },
      'No transaction found - creating orphaned transaction from webhook'
    );

    // Determine tenant from webhook request
    // First try to find the cart by paymentReference to get the correct tenant
    let tenantId: string;
    try {
      const carts = await payloadInstance.find({
        collection: 'carts',
        where: {
          paymentReference: {
            equals: payload.reference,
          },
        },
        limit: 1,
      });

      if (carts.docs.length > 0 && typeof carts.docs[0].tenant === 'object' && carts.docs[0].tenant !== null) {
        tenantId = carts.docs[0].tenant.id;
        logger.info(
          {
            tenantId,
            reference: payload.reference,
            cartId: carts.docs[0].id,
          },
          'Determined tenant for orphaned transaction from cart'
        );
      } else {
        // Cannot determine tenant - cart not found or has no tenant
        // This is a critical error as we cannot create a transaction without knowing which tenant it belongs to
        logger.error(
          {
            reference: payload.reference,
            cartFound: carts.docs.length > 0,
            cartHasTenant: carts.docs.length > 0 && carts.docs[0].tenant !== null,
          },
          'Cannot determine tenant for orphaned transaction - cart not found or has no tenant'
        );
        throw new Error(
          `Cannot create orphaned transaction for reference ${payload.reference}: Unable to determine tenant. Cart not found or missing tenant information.`
        );
      }
    } catch (error) {
      // Log comprehensive debugging information to help diagnose tenant determination issues
      const payloadInstance = await getPayload({ config });
      const allWebsites = await payloadInstance.find({
        collection: 'websites',
        limit: 100,
        pagination: false,
      });

      logger.error(
        {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          reference: payload.reference,
          businessEventId,
          webhookUrl: payloadInstance.config.serverURL,
          configuredWebsites: allWebsites.docs.map(w => ({
            id: w.id,
            title: w.title,
            domains: w.domains,
          })),
        },
        'Failed to determine tenant for orphaned transaction - cannot create transaction'
      );
      throw error; // Re-throw to be caught by outer try-catch
    }

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

    const transactionStatus = statusMap[payload.name] || 'pending';

    // Create transaction without order (will be linked later by SSE)
    transaction = await payloadInstance.create({
      collection: 'transactions',
      data: {
        order: null, // No order yet - SSE will link it
        paymentReference: payload.reference,
        amount: payload.amount.value,
        currency: payload.amount.currency,
        status: transactionStatus as TransactionStatus,
        paymentMethod: 'vipps',
        customer: null, // Don't know customer yet
        tenant: tenantId,
      },
      draft: false,
    });

    logger.info(
      {
        transactionId: transaction.id,
        reference: payload.reference,
        status: transactionStatus,
        businessEventId,
      },
      'Orphaned transaction created - SSE will link to order'
    );

    // Update business event with transaction relationship
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

    return; // Transaction created, SSE will handle order creation and linking
  } else {
    transaction = transactions.docs[0];
  }

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

  // Update business event with entity relationship (if not already set)
  if (!transaction.order) {
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
  }

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

  // Fetch full payment details from Vipps API for successful payments
  let paymentDetails;
  let customerId = transaction.customer;

  if (payload.name === 'AUTHORIZED' || payload.name === 'CAPTURED') {
    try {
      const vippsConfig = getVippsConfig();
      paymentDetails = await getPaymentDetails(vippsConfig, payload.reference);
      logger.info(
        {
          reference: payload.reference,
          state: paymentDetails.state,
          hasProfile: !!paymentDetails.profile,
          hasUserDetails: !!paymentDetails.userDetails,
          hasShipping: !!paymentDetails.shippingDetails,
        },
        'Retrieved full payment details from Vipps API'
      );

      // Update existing logged-in user with Vipps data
      if (customerId && paymentDetails.userDetails) {
        const userId = typeof customerId === 'string' ? customerId : customerId.id;
        await updateUserFromVipps(payloadInstance, userId, {
          given_name: paymentDetails.userDetails.firstName,
          middle_name: undefined, // Vipps userDetails doesn't have middle name
          family_name: paymentDetails.userDetails.lastName,
          email: paymentDetails.userDetails.email,
          phone_number: paymentDetails.userDetails.mobileNumber,
        });
        logger.info(
          {
            userId: customerId,
            email: paymentDetails.userDetails.email,
            reference: payload.reference,
          },
          'Updated logged-in user with Vipps data'
        );
      }
      // Try to find and link customer by email from Vipps userDetails (guest checkout)
      else if (paymentDetails.userDetails?.email && !customerId) {
        try {
          const users = await payloadInstance.find({
            collection: 'users',
            where: {
              email: {
                equals: paymentDetails.userDetails.email,
              },
            },
            limit: 1,
          });

          if (users.docs.length > 0) {
            customerId = users.docs[0].id;

            // Update user with Vipps data
            await updateUserFromVipps(payloadInstance, customerId, {
              given_name: paymentDetails.userDetails.firstName,
              middle_name: undefined, // Vipps userDetails doesn't have middle name
              family_name: paymentDetails.userDetails.lastName,
              email: paymentDetails.userDetails.email,
              phone_number: paymentDetails.userDetails.mobileNumber,
            });

            logger.info(
              {
                userId: customerId,
                email: paymentDetails.userDetails.email,
                reference: payload.reference,
              },
              'Found and updated existing user from Vipps email'
            );
          }
        } catch (error) {
          logger.warn(
            {
              error,
              email: paymentDetails.userDetails?.email,
              reference: payload.reference,
            },
            'Failed to lookup user by email from Vipps userDetails'
          );
        }
      }
    } catch (error) {
      logger.warn(
        {
          error,
          reference: payload.reference,
          eventType: payload.name,
        },
        'Failed to fetch payment details from Vipps API - continuing with webhook data only'
      );
    }
  }

  // Update transaction status and store full payment details if available
  await payloadInstance.update({
    collection: 'transactions',
    id: transaction.id,
    data: {
      status: newStatus as TransactionStatus,
      ...(paymentDetails && { data: paymentDetails as any }),
      ...(customerId && { customer: customerId }),
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

  // Automatic order creation for AUTHORIZED payments without order
  // This handles cases where the callback (SSE) fails or is delayed
  if ((payload.name === 'AUTHORIZED' || payload.name === 'CAPTURED') && !transaction.order && paymentDetails) {
    logger.info(
      {
        reference: payload.reference,
        transactionId: transaction.id,
        eventType: payload.name,
      },
      'Attempting automatic order creation from webhook (no order linked to transaction)'
    );

    try {
      // Import createOrderFromPayment from checkout actions
      const { createOrderFromPayment } = await import(
        '@/app/(frontend)/[locale]/checkout/vipps/actions'
      );
      const { createOrderAutoCreatedEvent } = await import(
        '@/app/(frontend)/[locale]/checkout/vipps/businessEvents'
      );

      // Attempt to create order from payment
      const orderResult = await createOrderFromPayment({
        paymentReference: payload.reference,
        paymentDetails: paymentDetails,
        // Extract user ID if customerId is a User object, otherwise use as string
        userId: customerId
          ? (typeof customerId === 'string' ? customerId : customerId.id)
          : undefined,
      });

      if (orderResult.success) {
        logger.info(
          {
            orderId: orderResult.data.orderId,
            transactionId: orderResult.data.transactionId,
            reference: payload.reference,
          },
          'Order auto-created successfully from webhook'
        );

        // Update transaction with order reference
        transaction = await payloadInstance.update({
          collection: 'transactions',
          id: transaction.id,
          data: {
            order: orderResult.data.orderId,
          },
        });

        // Create business event for tracking
        await createOrderAutoCreatedEvent(
          payload.reference,
          orderResult.data.orderId,
          paymentDetails.aggregate.authorizedAmount,
          'webhook'
        );

        logger.info(
          {
            orderId: orderResult.data.orderId,
            transactionId: transaction.id,
            reference: payload.reference,
          },
          'Webhook successfully created order and linked to transaction'
        );
      } else {
        // Order creation failed - this is a critical issue
        logger.error(
          {
            reference: payload.reference,
            transactionId: transaction.id,
            error: orderResult.error,
            errorMessage: orderResult.error.message,
            paymentState: paymentDetails.state,
            authorizedAmount: paymentDetails.aggregate.authorizedAmount,
          },
          'Automatic order creation from webhook failed - creating orphaned payment notification'
        );

        // Send orphaned payment notification for manual handling
        const { notifyOrphanedPayment } = await import(
          '@/app/(frontend)/[locale]/checkout/vipps/orphanedPaymentNotification'
        );

        await notifyOrphanedPayment({
          paymentReference: payload.reference,
          customerEmail: paymentDetails.profile?.email || paymentDetails.userDetails?.email || 'unknown',
          amount: paymentDetails.aggregate.authorizedAmount.value,
          currency: paymentDetails.aggregate.authorizedAmount.currency,
          paymentState: paymentDetails.state,
        });

        logger.warn(
          {
            reference: payload.reference,
            transactionId: transaction.id,
          },
          'Orphaned payment notification sent - manual order creation required'
        );
      }
    } catch (error) {
      // Unexpected error during automatic order creation
      logger.error(
        {
          error,
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          reference: payload.reference,
          transactionId: transaction.id,
          paymentState: paymentDetails?.state,
        },
        'CRITICAL: Unexpected error during automatic order creation from webhook'
      );

      // Send orphaned payment notification
      try {
        const { notifyOrphanedPayment } = await import(
          '@/app/(frontend)/[locale]/checkout/vipps/orphanedPaymentNotification'
        );

        await notifyOrphanedPayment({
          paymentReference: payload.reference,
          customerEmail: paymentDetails?.profile?.email || paymentDetails?.userDetails?.email || 'unknown',
          amount: paymentDetails?.aggregate?.authorizedAmount?.value || 0,
          currency: paymentDetails?.aggregate?.authorizedAmount?.currency || 'NOK',
          paymentState: paymentDetails?.state || 'UNKNOWN',
        });
      } catch (notifyError) {
        logger.error(
          {
            notifyError,
            reference: payload.reference,
          },
          'Failed to send orphaned payment notification after order creation error'
        );
      }
    }
  }

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
  transaction: Transaction,
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

    // Update cart status to completed and link to order
    // Idempotent: Only update if not already completed (prevents race condition with checkout callback)
    if (newOrderStatus === 'completed') {
      try {
        const carts = await payloadInstance.find({
          collection: 'carts' as any,
          where: {
            paymentReference: {
              equals: vippsPayload?.reference,
            },
          },
          limit: 1,
        });

        if (carts.docs.length > 0) {
          const cart = carts.docs[0] as any;

          // Idempotent check: Skip if already completed (checkout callback may have updated it)
          if (cart.status === 'completed') {
            logger.info(
              {
                cartId: cart.id,
                orderId,
                paymentReference: vippsPayload?.reference,
              },
              'Cart already marked as completed (likely by checkout callback) - skipping update'
            );
          } else {
            await payloadInstance.update({
              collection: 'carts' as any,
              id: cart.id,
              data: {
                status: 'completed',
                order: orderId,
              },
            });
            logger.info(
              {
                cartId: cart.id,
                orderId,
                paymentReference: vippsPayload?.reference,
                previousStatus: cart.status,
              },
              'Cart status updated to completed and linked to order (from webhook)'
            );
          }
        } else {
          logger.warn(
            {
              paymentReference: vippsPayload?.reference,
              orderId,
            },
            'No cart found for payment reference when updating status from webhook'
          );
        }
      } catch (error) {
        logger.error(
          {
            error,
            paymentReference: vippsPayload?.reference,
            orderId,
          },
          'Failed to update cart status from webhook'
        );
      }
    }

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
