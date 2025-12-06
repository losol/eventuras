'use server';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { Product } from '@/payload-types';
import { getMeUser } from '@/utilities/getMeUser';

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
  products?: Product[]; // Optional: product details for order summary
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
  products,
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

    // Try to get current user for pre-fill (optional)
    let currentUser;
    try {
      const userResult = await getMeUser();
      currentUser = userResult?.user;
      logger.info({ userId: currentUser?.id }, 'Got user for pre-fill');
    } catch (error) {
      // User not logged in - that's okay, just skip pre-fill
      logger.debug({ error }, 'No user session found, skipping pre-fill');
    }

    // Generate unique reference (in production, use proper order ID)
    const reference = `ORDER-${Date.now()}`;

    // Build order summary if products are provided
    const orderSummary = products
      ? {
          orderLines: items
            .map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product || !product.price?.amount) return null;

              const unitPrice = product.price.amount * 100; // Convert NOK to øre
              const totalAmount = unitPrice * item.quantity;

              return {
                id: product.id,
                name: product.title,
                quantity: item.quantity,
                unitPrice,
                totalAmount,
                productUrl: product.resourceId
                  ? `${process.env.NEXT_PUBLIC_CMS_URL}/${userLanguage}/products/${product.resourceId}`
                  : undefined,
              };
            })
            .filter(Boolean),
          orderBottomLine: {
            totalAmount: amount,
            currency,
          },
        }
      : undefined;

    // Create payment request
    const paymentRequest = {
      amount: {
        currency,
        value: amount,
      },
      paymentMethod: {
        type: 'WALLET',
      },
      customer: currentUser
        ? {
            // Pre-fill customer data if user is logged in
            phoneNumber: currentUser.phone_number || undefined,
            email: currentUser.email,
            firstName: currentUser.given_name || undefined,
            lastName: currentUser.family_name || undefined,
          }
        : undefined,
      reference,
      returnUrl: `${process.env.NEXT_PUBLIC_CMS_URL}/${userLanguage}/cart/payment-callback?reference=${reference}`,
      userFlow: 'WEB_REDIRECT',
      paymentDescription: `Order ${reference}`,
      ...(orderSummary && { orderSummary }), // Add order summary if available
      profile: {
        scope: 'name address email phoneNumber',
      },
      logistics: {
        // Dynamic shipping callback - Vipps calls this when user enters address
        dynamicOptionsCallback: {
          url: `${process.env.NEXT_PUBLIC_CMS_URL}/api/vipps/shipping-callback`,
          method: 'POST',
        },
        // Fallback options if callback fails or times out (8 sec)
        fixedOptions: [
          {
            brand: 'BRING', // Posten Norge
            type: 'HOME_DELIVERY',
            options: [
              {
                id: 'standard',
                amount: {
                  currency: 'NOK',
                  value: 9900, // 99.00 NOK shipping
                },
                name: 'Standard levering',
                description: '3-5 virkedager',
              },
              {
                id: 'express',
                amount: {
                  currency: 'NOK',
                  value: 19900, // 199.00 NOK shipping
                },
                name: 'Ekspress levering',
                description: '1-2 virkedager',
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
