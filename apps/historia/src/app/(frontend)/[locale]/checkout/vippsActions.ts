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

interface VippsCheckoutResponse {
  reference: string;
  checkoutFrontendUrl: string;
  token: string;
  pollingUrl: string;
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
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: VIPPS_CLIENT_ID,
        client_secret: VIPPS_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText, url: `${VIPPS_API_URL}/accesstoken/get` },
        'Failed to get Vipps access token',
      );
      // User-friendly error message
      return actionError('Betaling er midlertidig utilgjengelig. Prøv igjen senere.');
    }

    const data = (await response.json()) as VippsAccessTokenResponse;
    logger.info('Successfully obtained Vipps access token');

    return actionSuccess(data.access_token);
  } catch (error) {
    logger.error({ error }, 'Error getting Vipps access token');
    return actionError('Betaling er midlertidig utilgjengelig. Prøv igjen senere.');
  }
}

/**
 * Create Vipps Checkout session (embedded checkout on merchant site)
 */
export async function createVippsCheckout({
  amount,
  currency,
  items,
  products,
  userLanguage = 'no',
}: CreateVippsPaymentParams): Promise<ServerActionResult<VippsCheckoutResponse>> {
  try {
    logger.info({ amount, currency, items }, 'Creating Vipps Checkout session');

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
      logger.debug({ error }, 'No user session found, skipping pre-fill');
    }

    // Generate unique reference
    const reference = `ORDER-${Date.now()}`;

    // Build order lines from products
    const orderLines = products
      ? items
          .map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product || !product.price?.amount) return null;

            const unitPrice = Math.round(product.price.amount * 100); // Convert NOK to øre
            const totalAmount = unitPrice * item.quantity;

            return {
              id: product.id,
              name: product.title,
              totalAmount,
              unitInfo: {
                unitPrice,
                quantity: item.quantity.toString(),
                quantityUnit: 'PCS',
              },
              productUrl: product.resourceId
                ? `${process.env.NEXT_PUBLIC_CMS_URL}/${userLanguage}/products/${product.resourceId}`
                : undefined,
            };
          })
          .filter(Boolean)
      : [];

    // Build checkout request
    const checkoutRequest = {
      type: 'PAYMENT',
      reference,
      transaction: {
        amount: {
          currency,
          value: amount,
        },
        reference,
        paymentDescription: `Ordre ${reference}`,
        ...(orderLines.length > 0 && { orderLines }),
      },
      logistics: {
        fixedOptions: [], // Empty for digital products - no shipping
      },
      prefillCustomer: currentUser
        ? {
            phoneNumber: currentUser.phone_number || undefined,
            email: currentUser.email,
            firstName: currentUser.given_name || undefined,
            lastName: currentUser.family_name || undefined,
          }
        : undefined,
      merchantInfo: {
        callbackUrl: `${process.env.NEXT_PUBLIC_CMS_URL}/api/vipps/checkout-callback`,
        returnUrl: `${process.env.NEXT_PUBLIC_CMS_URL}/${userLanguage}/checkout/confirmation?reference=${reference}`,
        callbackAuthorizationToken: process.env.VIPPS_CALLBACK_TOKEN || 'your-secret-token',
      },
    };

    logger.info({ reference, checkoutRequest }, 'Sending checkout request to Vipps');

    const response = await fetch(`${VIPPS_API_URL}/checkout/v3/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY || '',
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
        'Vipps-System-Name': 'Historia',
        'Vipps-System-Version': '1.0.0',
        'Vipps-System-Plugin-Name': 'historia-webshop',
        'Vipps-System-Plugin-Version': '1.0.0',
        'Idempotency-Key': reference,
      },
      body: JSON.stringify(checkoutRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        // errorText is not JSON, use as-is
      }
      logger.error(
        { status: response.status, error: errorDetails, reference, request: checkoutRequest },
        'Failed to create Vipps checkout session',
      );
      // User-friendly error message
      return actionError('Kunne ikke starte betaling. Prøv igjen om litt.');
    }

    const data = (await response.json()) as VippsCheckoutResponse;

    logger.info(
      { reference, checkoutFrontendUrl: data.checkoutFrontendUrl },
      'Vipps checkout session created successfully',
    );

    return actionSuccess(data);
  } catch (error) {
    logger.error({ error, amount, currency }, 'Error creating Vipps checkout');
    return actionError('Kunne ikke starte betaling. Prøv igjen om litt.');
  }
}
