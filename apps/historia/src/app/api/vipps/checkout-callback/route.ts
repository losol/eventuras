import { type NextRequest, NextResponse } from 'next/server';

import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:api',
  context: { module: 'vipps-checkout-callback' },
});

interface VippsCheckoutCallback {
  sessionId: string;
  reference: string;
  sessionState: 'PaymentSuccessful' | 'PaymentTerminated' | 'PaymentInitiationFailed' | 'SessionExpired';
  paymentMethod?: 'Wallet' | 'Card';
  paymentDetails?: {
    type: 'wallet' | 'card';
    state: 'AUTHORISED' | 'TERMINATED' | 'FAILED';
    amount: {
      value: number;
      currency: string;
    };
  };
  shippingDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  billingDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info(
      {
        headers: Object.fromEntries(request.headers.entries()),
        url: request.url,
      },
      'Received Vipps callback request'
    );

    // Verify authorization token
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.VIPPS_CALLBACK_TOKEN;

    if (!expectedToken) {
      logger.error('VIPPS_CALLBACK_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!authHeader) {
      logger.error('No Authorization header provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authHeader !== expectedToken) {
      logger.error(
        {
          receivedToken: authHeader.substring(0, 10) + '...',
          expectedTokenPrefix: expectedToken.substring(0, 10) + '...',
        },
        'Authorization token mismatch'
      );
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse callback payload
    const payload = await request.json() as VippsCheckoutCallback;

    logger.info(
      {
        sessionId: payload.sessionId,
        reference: payload.reference,
        sessionState: payload.sessionState,
        paymentMethod: payload.paymentMethod,
      },
      'Received Vipps Checkout callback'
    );

    // Handle different session states
    switch (payload.sessionState) {
      case 'PaymentSuccessful':
        logger.info(
          {
            sessionId: payload.sessionId,
            reference: payload.reference,
            paymentMethod: payload.paymentMethod,
            paymentType: payload.paymentDetails?.type,
            paymentState: payload.paymentDetails?.state,
            amount: payload.paymentDetails?.amount,
            shippingDetails: payload.shippingDetails,
            billingDetails: payload.billingDetails,
          },
          'Payment successful - full details'
        );

        // TODO: Store order in database
        // TODO: Send confirmation email
        // TODO: Trigger order fulfillment

        break;

      case 'PaymentTerminated':
        logger.warn(
          {
            sessionId: payload.sessionId,
            reference: payload.reference,
            paymentMethod: payload.paymentMethod,
            paymentDetails: payload.paymentDetails,
          },
          'Payment terminated by user'
        );
        // TODO: Update order status to cancelled
        break;

      case 'PaymentInitiationFailed':
        logger.error(
          {
            sessionId: payload.sessionId,
            reference: payload.reference,
            paymentMethod: payload.paymentMethod,
            paymentDetails: payload.paymentDetails,
          },
          'Payment initiation failed'
        );
        // TODO: Update order status to failed
        break;

      case 'SessionExpired':
        logger.warn(
          {
            sessionId: payload.sessionId,
            reference: payload.reference,
            paymentMethod: payload.paymentMethod,
          },
          'Session expired'
        );
        // TODO: Update order status to expired
        break;

      default:
        logger.warn(
          {
            sessionId: payload.sessionId,
            sessionState: payload.sessionState,
            reference: payload.reference,
            fullPayload: payload,
          },
          'Unknown session state'
        );
    }

    const processingTime = Date.now() - startTime;
    logger.info(
      {
        sessionId: payload.sessionId,
        reference: payload.reference,
        sessionState: payload.sessionState,
        processingTimeMs: processingTime,
      },
      'Vipps callback processed successfully'
    );

    // MUST return 2XX response
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(
      {
        error,
        processingTimeMs: processingTime,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error processing Vipps callback'
    );

    // Still return 200 to avoid retries if it's a processing error
    // Only return error if it's an auth issue
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 200 }
    );
  }
}
