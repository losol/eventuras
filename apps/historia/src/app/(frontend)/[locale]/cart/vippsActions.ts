'use server';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:cart',
  context: { module: 'vippsActions' },
});

// Vipps API configuration
const VIPPS_API_URL = process.env.VIPPS_API_URL || 'https://apitest.vipps.no';
const VIPPS_MERCHANT_SERIAL_NUMBER = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;
const VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID;
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET;
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY;

interface VippsAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface VippsPaymentResponse {
  reference: string;
  redirectUrl: string;
  token?: string;
}

interface CreateVippsPaymentParams {
  amount: number; // in minor units (øre)
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  userLanguage?: string;
}

/**
 * Get Vipps access token
 */
async function getVippsAccessToken(): Promise<ServerActionResult<string>> {
  try {
    if (!VIPPS_CLIENT_ID || !VIPPS_CLIENT_SECRET || !VIPPS_SUBSCRIPTION_KEY) {
      logger.error('Missing Vipps API credentials');
      return actionError('Vipps configuration error');
    }

    logger.info('Fetching Vipps access token');

    const response = await fetch(`${VIPPS_API_URL}/accesstoken/get`, {
      method: 'POST',
      headers: {
        'client_id': VIPPS_CLIENT_ID,
        'client_secret': VIPPS_CLIENT_SECRET,
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText },
        'Failed to get Vipps access token',
      );
      return actionError(`Vipps authentication failed: ${response.status}`);
    }

    const data = (await response.json()) as VippsAccessTokenResponse;
    logger.info('Successfully obtained Vipps access token');

    return actionSuccess(data.access_token);
  } catch (error) {
    logger.error({ error }, 'Error getting Vipps access token');
    return actionError(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

/**
 * Create Vipps Express Checkout payment
 */
export async function createVippsExpressPayment({
  amount,
  currency,
  items,
  userLanguage = 'no',
}: CreateVippsPaymentParams): Promise<ServerActionResult<VippsPaymentResponse>> {
  try {
    logger.info({ amount, currency, items }, 'Creating Vipps Express payment');

    // Get access token
    const tokenResult = await getVippsAccessToken();
    if (!tokenResult.success) {
      return actionError(tokenResult.error.message);
    }

    const accessToken = tokenResult.data;

    // Generate unique reference (in production, use proper order ID)
    const reference = `ORDER-${Date.now()}`;

    // Create payment request
    const paymentRequest = {
      amount: {
        currency,
        value: amount,
      },
      paymentMethod: {
        type: 'WALLET',
      },
      customer: {
        phoneNumber: undefined, // Optional: pre-fill if known
      },
      reference,
      returnUrl: `${process.env.NEXT_PUBLIC_CMS_URL}/${userLanguage}/cart/payment-callback?reference=${reference}`,
      userFlow: 'WEB_REDIRECT',
      paymentDescription: `Order ${reference}`,
      profile: {
        scope: 'name address email phoneNumber',
      },
      shipping: {
        fixedOptions: [
          {
            brand: 'POSTNORD',
            type: 'HOME_DELIVERY',
            options: [
              {
                id: 'standard',
                amount: {
                  currency: 'NOK',
                  value: 9900, // 99.00 NOK shipping
                },
                name: 'Standard levering',
                estimatedDelivery: '3-5 virkedager',
              },
              {
                id: 'express',
                amount: {
                  currency: 'NOK',
                  value: 19900, // 199.00 NOK shipping
                },
                name: 'Ekspress levering',
                estimatedDelivery: '1-2 virkedager',
              },
            ],
          },
        ],
      },
    };

    logger.info({ reference, paymentRequest }, 'Sending payment request to Vipps');

    const response = await fetch(`${VIPPS_API_URL}/epayment/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY || '',
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
        'Idempotency-Key': reference, // Ensure idempotency
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText, reference },
        'Failed to create Vipps payment',
      );
      return actionError(`Payment creation failed: ${response.status}`);
    }

    const data = (await response.json()) as VippsPaymentResponse;

    logger.info(
      { reference, redirectUrl: data.redirectUrl },
      'Vipps payment created successfully',
    );

    return actionSuccess(data);
  } catch (error) {
    logger.error({ error, amount, currency }, 'Error creating Vipps payment');
    return actionError(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
