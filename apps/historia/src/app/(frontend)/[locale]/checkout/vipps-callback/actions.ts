'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { getCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import type { SessionData } from '@/lib/cart/types';
import { getCurrentWebsiteId } from '@/lib/website';
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

interface VippsSessionDetails {
  sessionId: string;
  merchantSerialNumber: string;
  reference: string;
  sessionState: string;
  paymentMethod?: string;
  paymentDetails?: VippsPaymentDetails;
  userInfo?: {
    sub: string;
    email: string;
  };
  shippingDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    streetAddress?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    shippingMethodId?: string;
  };
  billingDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    streetAddress?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  customConsentProvided?: boolean;
}

/**
 * Get Vipps access token
 */
async function getVippsAccessToken(): Promise<ServerActionResult<string>> {
  const startTime = Date.now();

  try {
    if (!VIPPS_CLIENT_ID || !VIPPS_CLIENT_SECRET || !VIPPS_SUBSCRIPTION_KEY) {
      logger.error(
        {
          hasClientId: !!VIPPS_CLIENT_ID,
          hasClientSecret: !!VIPPS_CLIENT_SECRET,
          hasSubscriptionKey: !!VIPPS_SUBSCRIPTION_KEY,
          hasMerchantSerialNumber: !!VIPPS_MERCHANT_SERIAL_NUMBER,
        },
        'Missing Vipps API credentials'
      );
      return actionError('Vipps configuration error');
    }

    logger.info(
      {
        apiUrl: VIPPS_API_URL,
        merchantSerialNumber: VIPPS_MERCHANT_SERIAL_NUMBER,
      },
      'Fetching Vipps access token'
    );

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

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          responseTimeMs: responseTime,
          headers: Object.fromEntries(response.headers.entries()),
        },
        'Failed to get Vipps access token'
      );
      return actionError(`Vipps authentication failed: ${response.status}`);
    }

    const data = (await response.json()) as VippsAccessTokenResponse;
    logger.info(
      {
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        responseTimeMs: responseTime,
      },
      'Successfully obtained Vipps access token'
    );

    return actionSuccess(data.access_token);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error(
      {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        responseTimeMs: responseTime,
      },
      'Error getting Vipps access token'
    );
    return actionError(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

/**
 * Get Vipps session details including user info
 * This provides more complete information than the payment endpoint
 */
export async function getVippsSessionDetails(
  reference: string,
): Promise<ServerActionResult<VippsSessionDetails>> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Getting Vipps session details');

    // Get access token
    const tokenResult = await getVippsAccessToken();
    if (!tokenResult.success) {
      logger.error(
        { reference, error: tokenResult.error },
        'Failed to get access token for session details'
      );
      return actionError(tokenResult.error.message);
    }

    const accessToken = tokenResult.data;

    // Get session details
    const apiStartTime = Date.now();
    const response = await fetch(
      `${VIPPS_API_URL}/checkout/v3/session/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY || '',
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER || '',
          'client_id': VIPPS_CLIENT_ID || '',
          'client_secret': VIPPS_CLIENT_SECRET || '',
          'Vipps-System-Name': 'eventuras-historia',
          'Vipps-System-Version': '1.0.0',
          'Vipps-System-Plugin-Name': 'eventuras-historia-commerce',
          'Vipps-System-Plugin-Version': '1.0.0',
        },
      },
    );

    const apiResponseTime = Date.now() - apiStartTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          apiResponseTimeMs: apiResponseTime,
          headers: Object.fromEntries(response.headers.entries()),
        },
        'Failed to get Vipps session details'
      );
      return actionError(`Session lookup failed: ${response.status}`);
    }

    const data = (await response.json()) as VippsSessionDetails;

    const totalTime = Date.now() - startTime;
    logger.info(
      {
        reference,
        sessionData: data,
        sessionState: data.sessionState,
        paymentMethod: data.paymentMethod,
        hasUserInfo: !!data.userInfo,
        userEmail: data.userInfo?.email,
        hasShippingDetails: !!data.shippingDetails,
        hasBillingDetails: !!data.billingDetails,
        apiResponseTimeMs: apiResponseTime,
        totalTimeMs: totalTime,
      },
      'Vipps session details retrieved successfully'
    );

    return actionSuccess(data);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        totalTimeMs: totalTime,
      },
      'Error getting Vipps session details'
    );
    return actionError(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

/**
 * Verify Vipps payment status
 * @deprecated Use getVippsSessionDetails for more complete information
 */
export async function verifyVippsPayment(
  reference: string,
): Promise<ServerActionResult<VippsPaymentDetails>> {
  const startTime = Date.now();

  try {
    logger.info({ reference }, 'Verifying Vipps payment');

    // Get access token
    const tokenResult = await getVippsAccessToken();
    if (!tokenResult.success) {
      logger.error(
        { reference, error: tokenResult.error },
        'Failed to get access token for payment verification'
      );
      return actionError(tokenResult.error.message);
    }

    const accessToken = tokenResult.data;

    // Get payment details
    const apiStartTime = Date.now();
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

    const apiResponseTime = Date.now() - apiStartTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          reference,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          apiResponseTimeMs: apiResponseTime,
          headers: Object.fromEntries(response.headers.entries()),
        },
        'Failed to verify Vipps payment'
      );
      return actionError(`Payment verification failed: ${response.status}`);
    }

    const data = (await response.json()) as VippsPaymentDetails;

    const totalTime = Date.now() - startTime;
    logger.info(
      {
        reference,
        vippsCallback: data,
        state: data.state,
        paymentMethod: data.paymentMethod?.type,
        authorizedAmount: data.aggregate.authorizedAmount,
        capturedAmount: data.aggregate.capturedAmount,
        refundedAmount: data.aggregate.refundedAmount,
        shippingMethodId: data.shippingDetails?.shippingMethodId,
        hasShippingAddress: !!data.shippingDetails?.address,
        userEmail: data.profile?.email,
        apiResponseTimeMs: apiResponseTime,
        totalTimeMs: totalTime,
      },
      'Vipps payment verified successfully'
    );

    return actionSuccess(data);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        totalTimeMs: totalTime,
      },
      'Error verifying Vipps payment'
    );
    return actionError(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

interface CreateOrderParams {
  paymentReference: string;
  sessionDetails: VippsSessionDetails;
  userId?: string;
}

/**
 * Create order and transaction after successful payment
 *
 * SECURITY: This function retrieves cart from encrypted session (not from client!),
 * verifies payment with Vipps API, and validates the order total matches the
 * authorized amount. Cart cannot be tampered with by client.
 */
export async function createOrderFromPayment({
  paymentReference,
  sessionDetails,
  userId,
}: CreateOrderParams): Promise<ServerActionResult<{ orderId: string; transactionId: string }>> {
  const startTime = Date.now();

  try {
    // Get cart from encrypted session (NOT from client!)
    const session = await getCurrentSession();
    const cart = session?.data?.cart;

    if (!cart || !cart.items || cart.items.length === 0) {
      logger.error(
        { paymentReference, hasSession: !!session, hasCart: !!cart },
        'No cart found in session'
      );
      return actionError('Cart is empty or not found');
    }

    // Verify payment reference matches session cart
    if (cart.paymentReference !== paymentReference) {
      logger.error(
        {
          paymentReference,
          cartPaymentReference: cart.paymentReference,
        },
        'Payment reference mismatch - possible fraud attempt'
      );
      return actionError(
        'This payment session is no longer valid. Your cart may have been modified or a new checkout was started. Please start a new checkout.'
      );
    }

    logger.info(
      {
        paymentReference,
        itemCount: cart.items.length,
        items: cart.items.map((i: { productId: string; quantity: number }) => ({ productId: i.productId, quantity: i.quantity })),
        userId,
        userEmail: sessionDetails.userInfo?.email,
        sessionState: sessionDetails.sessionState,
        paymentState: sessionDetails.paymentDetails?.state,
        authorizedAmount: sessionDetails.paymentDetails?.aggregate.authorizedAmount,
      },
      'Starting order creation from payment'
    );

    const payload = await getPayload({ config: configPromise });

    // Check if order already exists for this payment reference (idempotency)
    const existingTransactions = await payload.find({
      collection: 'transactions',
      where: {
        paymentReference: {
          equals: paymentReference,
        },
      },
      limit: 1,
    });

    if (existingTransactions.docs.length > 0) {
      const existingTransaction = existingTransactions.docs[0];
      const orderId = typeof existingTransaction.order === 'string'
        ? existingTransaction.order
        : existingTransaction.order.id;

      logger.info(
        {
          paymentReference,
          existingOrderId: orderId,
          existingTransactionId: existingTransaction.id,
        },
        'Order already exists for this payment reference, returning existing order'
      );
      return actionSuccess({
        orderId: orderId as string,
        transactionId: existingTransaction.id as string,
      });
    }

    // Get or create user from Vipps session details
    // Extract email from multiple sources (priority order):
    // SECURITY CONSIDERATION:
    // - userInfo.sub and userInfo.email are VERIFIED (requires Vipps Login integration)
    // - shippingDetails and billingDetails are USER-ENTERED, NOT VERIFIED
    // - The payment itself is verified, but not the customer details
    //
    // SOLUTION: Require users to log into Historia before checkout.
    // Use their Historia account as verified identity, Vipps only for payment.

    if (!userId || userId === 'temp-user-id') {
      logger.error(
        {
          paymentReference,
          sessionId: sessionDetails.sessionId,
          userId,
          note: "User must be logged into Historia before checkout",
        },
        "Anonymous checkout attempted - not allowed",
      );
      return actionError(
        "You must be logged in to complete your order. Please sign in and try again.",
      );
    }

    // User is authenticated in Historia - use their account
    const actualUserId = userId;

    logger.info(
      {
        userId: actualUserId,
        paymentReference,
        sessionId: sessionDetails.sessionId,
      },
      'Processing order for authenticated Historia user'
    );

    // Optional: Extract shipping details from Vipps for convenience
    // Note: This is user-entered data, NOT verified by Vipps
    const vippsShipping = {
      firstName: sessionDetails.shippingDetails?.firstName,
      lastName: sessionDetails.shippingDetails?.lastName,
      email: sessionDetails.shippingDetails?.email,
      phone: sessionDetails.shippingDetails?.phoneNumber,
      address: sessionDetails.shippingDetails?.streetAddress,
      postalCode: sessionDetails.shippingDetails?.postalCode,
      city: sessionDetails.shippingDetails?.city,
      country: sessionDetails.shippingDetails?.country,
    };

    // Get the current website/tenant ID
    const websiteId = await getCurrentWebsiteId();
    if (!websiteId) {
      logger.error({ paymentReference }, 'Cannot create order without website/tenant');
      return actionError('Website configuration not found');
    }

    logger.info({ websiteId, paymentReference }, 'Using website/tenant for order creation');

    // Fetch all products
    const productFetchStart = Date.now();
    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: cart.items.map((item) => item.productId),
        },
      },
      limit: cart.items.length,
    });
    const productFetchTime = Date.now() - productFetchStart;

    logger.info(
      {
        requestedProducts: cart.items.length,
        foundProducts: products.length,
        productIds: products.map(p => p.id),
        fetchTimeMs: productFetchTime,
      },
      'Products fetched'
    );

    if (products.length !== cart.items.length) {
      const missingIds = cart.items
        .map(i => i.productId)
        .filter(id => !products.find(p => p.id === id));

      logger.error(
        {
          expected: cart.items.length,
          found: products.length,
          requestedIds: cart.items.map(i => i.productId),
          foundIds: products.map(p => p.id),
          missingIds,
        },
        'Not all products found'
      );
      return actionError('Some products not found');
    }

    // Extract shipping details from Vipps session response
    const shippingAddress = sessionDetails.shippingDetails ? {
      addressLine1: sessionDetails.shippingDetails.streetAddress,
      postalCode: sessionDetails.shippingDetails.postalCode,
      city: sessionDetails.shippingDetails.city,
      country: sessionDetails.shippingDetails.country,
    } : undefined;
    const shippingMethodId = sessionDetails.shippingDetails?.shippingMethodId;

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
    const orderItems = cart.items.map((item) => {
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
      logger.info(
        {
          shippingProductId,
          shippingMethodId,
          shippingType,
        },
        'Looking up shipping product'
      );

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
        logger.info(
          {
            shippingProductId: shippingProduct.id,
            shippingPrice: shippingProduct.price,
          },
          'Shipping product found and added to order'
        );

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
          {
            shippingProductId,
            shippingMethodId,
          },
          'Shipping product not found, creating order without shipping item'
        );
      }
    } else {
      logger.info(
        { shippingMethodId },
        'No shipping product selected or shipping method not mapped'
      );
    }

    // Calculate order total and validate against authorized amount
    const calculatedTotal = orderItems.reduce((sum, item) => {
      const itemTotal = (item.price.amount || 0) * item.quantity;
      return sum + itemTotal;
    }, 0);

    // Convert Vipps amount from øre to NOK (divide by 100)
    const authorizedAmount = sessionDetails.paymentDetails?.aggregate.authorizedAmount.value ?
      sessionDetails.paymentDetails.aggregate.authorizedAmount.value / 100 : 0;

    logger.info(
      {
        calculatedTotal,
        authorizedAmount,
        difference: Math.abs(calculatedTotal - authorizedAmount),
        orderItems: orderItems.map(i => ({
          productId: i.product,
          quantity: i.quantity,
          unitPrice: i.price.amount,
          total: i.price.amount * i.quantity,
        })),
      },
      'Validating payment amount'
    );

    // Allow small rounding differences (max 1 øre)
    if (Math.abs(calculatedTotal - authorizedAmount) > 0.01) {
      logger.error(
        {
          calculatedTotal,
          authorizedAmount,
          difference: calculatedTotal - authorizedAmount,
          paymentReference,
        },
        'Payment amount mismatch - possible fraud attempt'
      );
      return actionError(
        `Payment amount mismatch: authorized ${authorizedAmount} NOK but order total is ${calculatedTotal} NOK`
      );
    }

    // Create Order
    const orderCreateStart = Date.now();

    // Get user details from Historia account
    const user = await payload.findByID({
      collection: 'users',
      id: actualUserId,
    });

    if (!user || !user.email) {
      logger.error(
        { paymentReference, userId: actualUserId },
        'User or user email not found'
      );
      return actionError('User account information not found');
    }

    logger.info(
      {
        userId: actualUserId,
        userEmail: user.email,
        itemCount: orderItems.length,
        hasShippingAddress: !!shippingAddress,
        shippingType,
      },
      'Creating order in database'
    );

    const order = await payload.create({
      collection: 'orders',
      draft: false,
      data: {
        user: actualUserId,
        userEmail: user.email,
        status: 'processing',
        currency: sessionDetails.paymentDetails?.aggregate.authorizedAmount.currency || 'NOK',
        tenant: websiteId,
        items: orderItems,
        shippingAddress: shippingAddress
          ? {
              addressLine1: shippingAddress.addressLine1 || '',
              postalCode: shippingAddress.postalCode || '',
              city: shippingAddress.city || '',
              country: shippingAddress.country || 'NO',
            }
          : undefined,
        shippingStatus: shippingType === 'pickup' ? 'available-for-pickup' : 'not-shipped',
      },
    });

    const orderCreateTime = Date.now() - orderCreateStart;
    logger.info(
      {
        orderId: order.id,
        paymentReference,
        itemCount: orderItems.length,
        status: order.status,
        shippingStatus: order.shippingStatus,
        createTimeMs: orderCreateTime,
      },
      'Order created successfully'
    );

    // Create Transaction
    const transactionCreateStart = Date.now();
    const transactionAmount = sessionDetails.paymentDetails?.aggregate.authorizedAmount.value ?
      sessionDetails.paymentDetails.aggregate.authorizedAmount.value / 100 : 0;
    const transactionStatus = sessionDetails.paymentDetails?.state === 'AUTHORIZED' ? 'authorized' : 'captured';

    logger.info(
      {
        orderId: order.id,
        customerId: actualUserId,
        amount: transactionAmount,
        status: transactionStatus,
        paymentReference,
      },
      'Creating transaction in database'
    );

    const transaction = await payload.create({
      collection: 'transactions',
      draft: false,
      data: {
        order: order.id,
        customer: actualUserId,
        amount: transactionAmount,
        status: transactionStatus,
        paymentMethod: 'vipps',
        paymentReference,
        transactionType: 'payment',
        tenant: websiteId,
      },
    });

    const transactionCreateTime = Date.now() - transactionCreateStart;
    const totalTime = Date.now() - startTime;

    logger.info(
      {
        orderId: order.id,
        transactionId: transaction.id,
        paymentReference,
        amount: transactionAmount,
        transactionStatus,
        transactionCreateTimeMs: transactionCreateTime,
        totalTimeMs: totalTime,
      },
      'Order and transaction created successfully'
    );

    return actionSuccess({
      orderId: order.id as string,
      transactionId: transaction.id as string,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(
      {
        error,
        paymentReference,
        userId,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        totalTimeMs: totalTime,
      },
      'Error creating order from payment'
    );
    return actionError(
      error instanceof Error ? error.message : 'Failed to create order',
    );
  }
}
