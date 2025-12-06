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
  try {
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

    if (!authHeader || authHeader !== expectedToken) {
      logger.warn({ authHeader }, 'Invalid authorization token');
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
            reference: payload.reference,
            amount: payload.paymentDetails?.amount,
          },
          'Payment successful'
        );

        // TODO: Store order in database
        // TODO: Send confirmation email
        // TODO: Trigger order fulfillment

        break;

      case 'PaymentTerminated':
        logger.warn(
          { reference: payload.reference },
          'Payment terminated by user'
        );
        // TODO: Update order status to cancelled
        break;

      case 'PaymentInitiationFailed':
        logger.error(
          { reference: payload.reference },
          'Payment initiation failed'
        );
        // TODO: Update order status to failed
        break;

      case 'SessionExpired':
        logger.warn(
          { reference: payload.reference },
          'Session expired'
        );
        // TODO: Update order status to expired
        break;

      default:
        logger.warn(
          { sessionState: payload.sessionState },
          'Unknown session state'
        );
    }

    // MUST return 2XX response
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    logger.error({ error }, 'Error processing Vipps callback');

    // Still return 200 to avoid retries if it's a processing error
    // Only return error if it's an auth issue
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 200 }
    );
  }
}
