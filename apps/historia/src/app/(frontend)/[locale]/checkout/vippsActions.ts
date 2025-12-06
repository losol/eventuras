'use server';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { getCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import { setCartPaymentReference } from '@/app/actions/cart';
import { appConfig, publicEnv } from '@/config';
import type { SessionData } from '@/lib/cart/types';
import type { Product } from '@/payload-types';
import { getMeUser } from '@/utilities/getMeUser';

const logger = Logger.create({
  namespace: 'historia:cart',
  context: { module: 'vippsActions' },
});

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
    if (!appConfig.env.VIPPS_CLIENT_ID || !appConfig.env.VIPPS_CLIENT_SECRET || !appConfig.env.VIPPS_SUBSCRIPTION_KEY) {
      logger.error('Missing Vipps API credentials');
      return actionError('Vipps configuration error');
    }

    logger.info('Fetching Vipps access token');

    const response = await fetch(`${appConfig.env.VIPPS_API_URL}/accesstoken/get`, {
      method: 'POST',
      headers: {
        'client_id': appConfig.env.VIPPS_CLIENT_ID,
        'client_secret': appConfig.env.VIPPS_CLIENT_SECRET,
        'Ocp-Apim-Subscription-Key': appConfig.env.VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': appConfig.env.VIPPS_MERCHANT_SERIAL_NUMBER,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText, url: `${appConfig.env.VIPPS_API_URL}/accesstoken/get` },
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

    // Check if cart already has a payment reference (prevent duplicate checkouts)
    const session = await getCurrentSession();
    const existingReference = session?.data?.cart?.paymentReference;

    // Reuse existing reference if present, otherwise generate new one
    const reference = existingReference || `ORDER-${Date.now()}`;

    if (existingReference) {
      logger.info({ reference }, 'Reusing existing payment reference from cart');
    } else {
      logger.info({ reference }, 'Generated new payment reference');
    }

    // Build order lines from products
    const orderLines = products
      ? items
          .map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product || !product.price?.amount) return null;

            const unitPrice = Math.round(product.price.amount * 100); // Convert NOK to øre
            const totalAmount = unitPrice * item.quantity;

            // Calculate VAT (25% Norwegian standard rate)
            const taxRate = 2500; // 25.00% in basis points
            const totalAmountExcludingTax = Math.round(totalAmount / 1.25);
            const totalTaxAmount = totalAmount - totalAmountExcludingTax;

            return {
              id: product.id,
              name: product.title,
              totalAmount,
              totalAmountExcludingTax,
              totalTaxAmount,
              taxRate,
              taxPercentage: 25,
              unitInfo: {
                unitPrice,
                quantity: item.quantity.toString(),
                quantityUnit: 'PCS',
              },
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
        ...(orderLines.length > 0 && {
          orderSummary: {
            orderLines,
            orderBottomLine: {
              currency,
              totalAmount: amount,
              totalAmountExcludingTax: Math.round(amount / 1.25), // Assuming 25% VAT
              totalTax: amount - Math.round(amount / 1.25),
            },
          },
        }),
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
        callbackUrl: `${publicEnv.NEXT_PUBLIC_CMS_URL}/api/vipps/checkout-callback`,
        returnUrl: `${publicEnv.NEXT_PUBLIC_CMS_URL}/${userLanguage}/checkout/vipps-callback?reference=${reference}`,
        callbackAuthorizationToken: appConfig.env.VIPPS_CALLBACK_TOKEN,
      },
      ...(orderLines.length > 0 && {
        configuration: {
          showOrderSummary: true,
        },
      }),
    };

    logger.info({ reference, checkoutRequest }, 'Sending checkout request to Vipps');

    const response = await fetch(`${appConfig.env.VIPPS_API_URL}/checkout/v3/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'client_id': appConfig.env.VIPPS_CLIENT_ID,
        'client_secret': appConfig.env.VIPPS_CLIENT_SECRET,
        'Ocp-Apim-Subscription-Key': appConfig.env.VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': appConfig.env.VIPPS_MERCHANT_SERIAL_NUMBER,
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

    // Store payment reference in cart session
    const cartUpdateResult = await setCartPaymentReference(reference);
    if (!cartUpdateResult.success) {
      logger.error(
        { error: cartUpdateResult.error, reference },
        'Failed to store payment reference in cart session',
      );
      // Don't fail the checkout, but log the error
      // The payment can still complete, but order creation might fail
    }

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
