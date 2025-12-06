'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { Product } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'paymentCallbackActions' },
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

interface VippsPaymentDetails {
  aggregate: {
    authorizedAmount: {
      currency: string;
      value: number;
    };
    capturedAmount: {
      currency: string;
      value: number;
    };
    refundedAmount: {
      currency: string;
      value: number;
    };
  };
  state: 'CREATED' | 'AUTHORIZED' | 'TERMINATED' | 'ABORTED' | 'EXPIRED';
  paymentMethod?: {
    type: string;
  };
  profile?: {
    email?: string;
    name?: string;
    phoneNumber?: string;
  };
  shippingDetails?: {
    shippingMethodId?: string;
    address?: {
      addressLine1?: string;
      addressLine2?: string;
      postalCode?: string;
      city?: string;
      country?: string;
    };
  };
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
 * Verify Vipps payment status
 */
export async function verifyVippsPayment(
  reference: string,
): Promise<ServerActionResult<VippsPaymentDetails>> {
  try {
    logger.info({ reference }, 'Verifying Vipps payment');

    // Get access token
    const tokenResult = await getVippsAccessToken();
    if (!tokenResult.success) {
      return actionError(tokenResult.error.message);
    }

    const accessToken = tokenResult.data;

    // Get payment details
    const response = await fetch(
      `${VIPPS_API_URL}/epayment/v1/payments/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY || '',
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText, reference },
        'Failed to verify Vipps payment',
      );
      return actionError(`Payment verification failed: ${response.status}`);
    }

    const data = (await response.json()) as VippsPaymentDetails;

    logger.info(
      { reference, state: data.state, amount: data.aggregate.authorizedAmount },
      'Vipps payment verified',
    );

    return actionSuccess(data);
  } catch (error) {
    logger.error({ error, reference }, 'Error verifying Vipps payment');
    return actionError(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

interface CreateOrderParams {
  paymentReference: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentDetails: VippsPaymentDetails;
  userId: string;
  userEmail: string;
}

/**
 * Create order and transaction after successful payment
 */
export async function createOrderFromPayment({
  paymentReference,
  items,
  paymentDetails,
  userId,
  userEmail,
}: CreateOrderParams): Promise<ServerActionResult<{ orderId: string; transactionId: string }>> {
  try {
    logger.info({ paymentReference, items }, 'Creating order from payment');

    const payload = await getPayload({ config: configPromise });

    // Fetch all products
    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
      limit: items.length,
    });

    if (products.length !== items.length) {
      logger.error(
        { expected: items.length, found: products.length },
        'Not all products found',
      );
      return actionError('Some products not found');
    }

    // Extract shipping details from Vipps response
    const shippingAddress = paymentDetails.shippingDetails?.address;
    const shippingMethodId = paymentDetails.shippingDetails?.shippingMethodId;

    // Determine shipping product ID based on method
    // These product IDs should match the shipping products created in the database
    let shippingProductId: string | null = null;
    let shippingType: 'delivery' | 'pickup' = 'delivery';

    if (shippingMethodId === 'standard') {
      shippingProductId = 'shipping-standard'; // TODO: Replace with actual product ID
      shippingType = 'delivery';
    } else if (shippingMethodId === 'express') {
      shippingProductId = 'shipping-express'; // TODO: Replace with actual product ID
      shippingType = 'delivery';
    } else if (shippingMethodId === 'pickup-popup') {
      shippingProductId = 'shipping-pickup-popup'; // TODO: Replace with actual product ID
      shippingType = 'pickup';
    } else if (shippingMethodId === 'pickup-valnesfjord') {
      shippingProductId = 'shipping-pickup-valnesfjord'; // TODO: Replace with actual product ID
      shippingType = 'pickup';
    }

    // Map products to order items with prices
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId) as Product;
      return {
        product: product.id,
        quantity: item.quantity,
        price: {
          amount: product.price?.amount || 0,
          currency: product.price?.currency || 'NOK',
          vatRate: product.price?.vatRate || 25,
        },
      };
    });

    // Add shipping as an order item if selected
    if (shippingProductId) {
      // Fetch shipping product
      const { docs: shippingProducts } = await payload.find({
        collection: 'products',
        where: {
          id: {
            equals: shippingProductId,
          },
        },
        limit: 1,
      });

      if (shippingProducts.length > 0) {
        const shippingProduct = shippingProducts[0] as Product;
        orderItems.push({
          product: shippingProduct.id,
          quantity: 1,
          price: {
            amount: shippingProduct.price?.amount || 0,
            currency: shippingProduct.price?.currency || 'NOK',
            vatRate: shippingProduct.price?.vatRate || 25,
          },
        });
      } else {
        logger.warn(
          { shippingProductId },
          'Shipping product not found, creating order without shipping item',
        );
      }
    }

    // Create Order
    const order = await payload.create({
      collection: 'orders',
      data: {
        user: userId,
        userEmail: userEmail,
        status: 'processing',
        currency: paymentDetails.aggregate.authorizedAmount.currency,
        items: orderItems,
        shippingAddress: shippingAddress
          ? {
              addressLine1: shippingAddress.addressLine1 || '',
              addressLine2: shippingAddress.addressLine2,
              postalCode: shippingAddress.postalCode || '',
              city: shippingAddress.city || '',
              country: shippingAddress.country || 'NO',
            }
          : undefined,
        shippingStatus: shippingType === 'pickup' ? 'available-for-pickup' : 'not-shipped',
      },
    });

    logger.info({ orderId: order.id, paymentReference }, 'Order created');

    // Create Transaction
    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        order: order.id,
        customer: userId,
        amount: paymentDetails.aggregate.authorizedAmount.value / 100, // Convert from øre to NOK
        status:
          paymentDetails.state === 'AUTHORIZED' ? 'authorized' : 'captured',
        paymentMethod: 'vipps',
        paymentReference,
        transactionType: 'payment',
      },
    });

    logger.info(
      { orderId: order.id, transactionId: transaction.id, paymentReference },
      'Order and transaction created successfully',
    );

    return actionSuccess({
      orderId: order.id as string,
      transactionId: transaction.id as string,
    });
  } catch (error) {
    logger.error({ error, paymentReference }, 'Error creating order from payment');
    return actionError(
      error instanceof Error ? error.message : 'Failed to create order',
    );
  }
}
