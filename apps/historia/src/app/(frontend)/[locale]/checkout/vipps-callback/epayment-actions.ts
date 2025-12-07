'use server';

import crypto from 'crypto';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { getCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import type { Cart } from '@/lib/cart/types';
import {
  getPaymentDetails,
  type PaymentDetails,
} from '@/lib/vipps/epayment-client';
import { getCurrentWebsiteId } from '@/lib/website';
import type { Product } from '@/payload-types';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'paymentCallbackActions' },
});

/**
 * Generate a secure random password for guest checkout users
 * Uses crypto.randomBytes for cryptographically strong random data
 */
function generateSecurePassword(): string {
  // Generate 32 random bytes and convert to base64
  // This creates a strong password that users won't need (guest checkout)
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Get payment details from Vipps ePayment API
 */
export async function getVippsPaymentDetails(
  reference: string,
): Promise<ServerActionResult<PaymentDetails>> {
  const startTime = Date.now();

  try {
    const paymentDetails = await getPaymentDetails(reference);

    logger.info(
      {
        reference,
        paymentDetails
      },
      'ePayment details retrieved successfully'
    );

    return actionSuccess(paymentDetails);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(
      {
        error,
        reference,
        errorMessage: error instanceof Error ? error.message : String(error),
        totalTimeMs: totalTime,
      },
      'Error getting ePayment details'
    );
    return actionError(
      error instanceof Error ? error.message : 'Failed to get payment details',
    );
  }
}

interface CreateOrderParams {
  paymentReference: string;
  paymentDetails: PaymentDetails;
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
  paymentDetails,
  userId,
}: CreateOrderParams): Promise<ServerActionResult<{ orderId: string; transactionId: string }>> {
  const startTime = Date.now();

  try {
    // Get cart from encrypted session
    const session = await getCurrentSession();
    const cart = session?.data?.cart as Cart | undefined;

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
        paymentState: paymentDetails.state,
        authorizedAmount: paymentDetails.aggregate.authorizedAmount,
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

    // If no authenticated user, try to find or create from Vipps profile data
    let effectiveUserId = userId;

    if (!userId) {
      // Try to get user info from Vipps profile sharing or user details
      const vippsEmail = paymentDetails.profile?.email || paymentDetails.userDetails?.email;
      const vippsPhone = paymentDetails.profile?.phoneNumber || paymentDetails.userDetails?.mobileNumber;
      const vippsFirstName = paymentDetails.profile?.givenName || paymentDetails.userDetails?.firstName;
      const vippsLastName = paymentDetails.profile?.familyName || paymentDetails.userDetails?.lastName;

      if (!vippsEmail) {
        logger.error(
          {
            paymentReference,
          },
          "Guest checkout attempted but email not available from Vipps",
        );
        return actionError(
          "Email address is required for order confirmation. Please ensure Vipps has permission to share your email address.",
        );
      }

      logger.info(
        {
          paymentReference,
          hasEmail: !!vippsEmail,
          hasPhone: !!vippsPhone,
          hasName: !!(vippsFirstName && vippsLastName),
        },
        'Guest checkout - finding or creating user from Vipps data'
      );

      // Try to find existing user by email
      const usersByEmail = await payload.find({
        collection: 'users',
        where: {
          email: { equals: vippsEmail },
        },
        limit: 1,
      });

      const existingUser = usersByEmail.docs[0];

      if (existingUser) {
        effectiveUserId = existingUser.id;
        logger.info(
          {
            userId: effectiveUserId,
            email: existingUser.email,
          },
          'Found existing user for checkout'
        );
      } else {
        // Create new user from Vipps data
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: vippsEmail,
            password: generateSecurePassword(),
            phone_number: vippsPhone,
            given_name: vippsFirstName,
            family_name: vippsLastName,
          },
        });
        effectiveUserId = newUser.id;
        logger.info(
          {
            userId: effectiveUserId,
            email: newUser.email,
            hasPhone: !!vippsPhone,
            hasName: !!(vippsFirstName && vippsLastName),
          },
          'Created new user from Vipps profile'
        );
      }
    } else {
      logger.info(
        {
          userId: effectiveUserId,
          paymentReference,
          pspReference: paymentDetails.pspReference,
        },
        'Processing order for authenticated Historia user'
      );
    }

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

    // Calculate order total and validate against authorized amount
    const calculatedTotal = orderItems.reduce((sum, item) => {
      const itemTotal = (item.price.amount || 0) * item.quantity;
      return sum + itemTotal;
    }, 0);

    // Convert Vipps amount from øre to NOK (divide by 100)
    const authorizedAmount = paymentDetails.aggregate.authorizedAmount.value / 100;

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

    // Get user details from Historia account
    const user = await payload.findByID({
      collection: 'users',
      id: effectiveUserId!,
    });

    if (!user || !user.email) {
      logger.error(
        { paymentReference, userId: effectiveUserId },
        'User or user email not found'
      );
      return actionError('User account information not found');
    }

    logger.info(
      {
        userId: effectiveUserId,
        userEmail: user.email,
        itemCount: orderItems.length,
      },
      'Creating order in database'
    );

    // Create Order
    const orderCreateStart = Date.now();
    const order = await payload.create({
      collection: 'orders',
      draft: false,
      data: {
        user: effectiveUserId!,
        userEmail: user.email,
        status: 'processing',
        currency: paymentDetails.aggregate.authorizedAmount.currency,
        tenant: websiteId,
        items: orderItems,
        shippingStatus: 'not-shipped',
      },
    });

    const orderCreateTime = Date.now() - orderCreateStart;
    logger.info(
      {
        orderId: order.id,
        paymentReference,
        itemCount: orderItems.length,
        status: order.status,
        createTimeMs: orderCreateTime,
      },
      'Order created successfully'
    );

    // Create Transaction
    const transactionCreateStart = Date.now();
    const transactionAmount = paymentDetails.aggregate.authorizedAmount.value / 100;
    const transactionStatus = paymentDetails.state === 'AUTHORIZED' ? 'authorized' : 'captured';

    logger.info(
      {
        orderId: order.id,
        customerId: effectiveUserId,
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
        customer: effectiveUserId!,
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
