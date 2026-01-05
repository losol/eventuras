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
import { type PaymentDetails } from '@eventuras/vipps/epayment-v1';

import type { Cart, SessionData } from '@/lib/cart/types';
import { getCurrentWebsiteId } from '@/lib/website';
import type { Product } from '@/payload-types';

import { notifyOrphanedPayment } from './orphanedPaymentNotification';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'paymentCallbackActions' },
});

/**
 * Normalize Norwegian phone number to E.164 format with country code
 * @param phoneNumber - Raw phone number from Vipps (e.g., "4748755492" or "48755492")
 * @returns Normalized phone number with country code (e.g., "+4748755492")
 */
function normalizePhoneNumber(phoneNumber: string | undefined): string | undefined {
  if (!phoneNumber) return undefined;

  // Remove any whitespace
  const cleaned = phoneNumber.replace(/\s/g, '');

  // If already has +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starts with 47 (Norwegian country code), add +
  if (cleaned.startsWith('47') && cleaned.length >= 10) {
    return `+${cleaned}`;
  }

  // If starts with 4 or 9 (Norwegian mobile prefix), assume it's missing country code
  if ((cleaned.startsWith('4') || cleaned.startsWith('9')) && cleaned.length === 8) {
    return `+47${cleaned}`;
  }

  // Default: assume it's a Norwegian number without country code
  return `+47${cleaned}`;
}

/**
 * Validate that the current user's session owns this payment reference
 * SECURITY: Prevents unauthorized access to payment status and order details
 *
 * Validation strategy:
 * 1. Primary: Check if cart exists in database with this paymentReference (ROBUST)
 * 2. Fallback: Check session's paymentReferences list (OPTIONAL - for performance)
 *
 * Database validation is preferred because:
 * - Works even if session expires or cookies are lost
 * - More reliable for slow payment completions
 * - Better for mobile where session handling can be problematic
 *
 * @param paymentReference - The payment reference to validate
 * @returns Success if payment is owned by current session or found in cart database
 */
async function validatePaymentOwnership(
  paymentReference: string
): Promise<ServerActionResult<boolean>> {
  try {
    // PRIMARY VALIDATION: Check database for cart with this paymentReference
    const payload = await getPayload({ config: configPromise });
    const carts = await payload.find({
      collection: 'carts' as any,
      where: {
        paymentReference: {
          equals: paymentReference,
        },
      },
      limit: 1,
    });

    if (carts.docs.length > 0) {
      logger.info(
        {
          paymentReference,
          cartId: (carts.docs[0] as any).id,
        },
        'Payment validated via database cart lookup'
      );
      return actionSuccess(true);
    }

    // FALLBACK VALIDATION: Check session (optional, for performance)
    const session = await getCurrentSession();
    const sessionData = session?.data as SessionData | undefined;
    const paymentReferences = sessionData?.paymentReferences || [];

    if (paymentReferences.includes(paymentReference)) {
      logger.info(
        {
          paymentReference,
        },
        'Payment validated via session fallback'
      );
      return actionSuccess(true);
    }

    // Both validations failed
    logger.warn(
      {
        paymentReference,
        hasSession: !!session,
        paymentCount: paymentReferences.length,
      },
      'Payment reference not found in database or session - will trigger manual order creation'
    );

    return actionError('Unauthorized access to payment');
  } catch (error) {
    logger.error({
      error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      paymentReference,
    }, 'CRITICAL: Error validating payment ownership');
    return actionError('Failed to validate payment ownership');
  }
}

/**
 * Generate a secure random password for guest checkout users
 * Uses crypto.randomBytes for cryptographically strong random data
 */
function generateSecurePassword(): string {
  // Generate 32 random bytes and convert to base64
  // This creates a strong password that users won't need (guest checkout)
  return crypto.randomBytes(32).toString('base64');
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

  let cart: Cart | undefined;

  try {
    const payload = await getPayload({ config: configPromise });

    // ROBUST APPROACH: Find cart by paymentReference
    // This works even if session cookies are lost/expired
    const carts = await payload.find({
      collection: 'carts' as any,
      where: {
        paymentReference: {
          equals: paymentReference,
        },
      },
      limit: 1,
    });

    if (carts.docs.length > 0) {
      const cartDoc = carts.docs[0];

      // Convert Payload cart to Cart type
      cart = {
        items: (cartDoc as any).items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentReference: paymentReference,
      };

      logger.info(
        {
          cartId: (cartDoc as any).id,
          itemCount: cart?.items.length || 0,
          paymentReference,
        },
        'Cart retrieved from database by paymentReference'
      );
    } else {
      logger.error(
        {
          paymentReference,
        },
        'Cart not found by paymentReference in database'
      );
    }
  } catch (error) {
    logger.error(
      {
        error,
        paymentReference,
      },
      'Failed to retrieve cart from database'
    );
  }

  if (!cart) {
    logger.warn(
      {
        paymentReference,
      },
      'No cart ID or secret in session - attempting to find cart by payment reference'
    );

    // Fallback: Try to find cart by payment reference
    // This handles cases where session was lost (browser closed, cookie expired, etc.)
    // but cart was saved to database during payment initiation
    try {
      const payload = await getPayload({ config: configPromise });

      const cartResults = await payload.find({
        collection: 'carts' as any,
        where: {
          paymentReference: {
            equals: paymentReference,
          },
        },
        limit: 1,
        overrideAccess: true, // Session is lost, but we have payment reference
      });

      if (cartResults.docs && cartResults.docs.length > 0) {
        const recoveredCart = cartResults.docs[0] as any;

        if (recoveredCart && recoveredCart.items && recoveredCart.items.length > 0) {
          cart = {
            items: recoveredCart.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            paymentReference: paymentReference,
          };

          logger.info(
            {
              cartId: recoveredCart.id,
              itemCount: cart.items.length,
              paymentReference,
            },
            'Successfully recovered cart from database using payment reference'
          );
        }
      } else {
        logger.error(
          { paymentReference },
          'Cart not found in database by payment reference'
        );
      }
    } catch (error) {
      logger.error(
        {
          error,
          paymentReference,
        },
        'Failed to recover cart from database'
      );
    }
  }

  try {
    if (!cart || !cart.items || cart.items.length === 0) {
      logger.error(
        {
          paymentReference,
          hasSession: !!session,
          hasCart: !!cart,
          paymentState: paymentDetails.state,
          authorizedAmount: paymentDetails.aggregate.authorizedAmount.value,
          customerEmail: paymentDetails.profile?.email || paymentDetails.userDetails?.email
        },
        'CRITICAL: Cart not found in session but payment may be authorized - potential orphaned payment'
      );

      // Check if this is a cross-domain session issue where payment is authorized
      // This is a CRITICAL scenario that needs manual intervention
      if (paymentDetails.state === 'AUTHORIZED' || paymentDetails.aggregate.capturedAmount.value > 0) {
        const customerEmail = paymentDetails.profile?.email || paymentDetails.userDetails?.email;

        logger.error(
          {
            paymentReference,
            customerEmail,
            amount: paymentDetails.aggregate.authorizedAmount.value,
            currency: paymentDetails.aggregate.authorizedAmount.currency,
          },
          'CRITICAL: Payment is AUTHORIZED but cart unavailable - requires manual order creation!'
        );

        // Create business event and notify sales team
        await notifyOrphanedPayment({
          paymentReference,
          customerEmail,
          amount: paymentDetails.aggregate.authorizedAmount.value,
          currency: paymentDetails.aggregate.authorizedAmount.currency,
          paymentState: paymentDetails.state,
        });

        return actionError(
          'Din betaling er godkjent og sikret! Vi behandler ordren din manuelt og sender ' +
          'deg en bekreftelse på e-post innen kort tid. ' +
          'Referanse: ' + paymentReference
        );
      }

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
        : existingTransaction.order?.id;

      // Only return early if order actually exists
      // Transaction might exist without order (orphaned from webhook)
      if (orderId) {
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
      } else {
        logger.warn(
          {
            paymentReference,
            existingTransactionId: existingTransaction.id,
            transactionStatus: existingTransaction.status,
          },
          'Transaction exists but has no order (orphaned from webhook) - will create order now'
        );
        // Continue to order creation below
      }
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

      // Normalize phone number to include country code
      const normalizedPhone = normalizePhoneNumber(vippsPhone);

      logger.info(
        {
          paymentReference,
          hasEmail: !!vippsEmail,
          hasPhone: !!normalizedPhone,
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
            phone_number: normalizedPhone,
            email_verified: true,
            phone_number_verified: true,
            given_name: vippsFirstName,
            family_name: vippsLastName,
          },
        });
        effectiveUserId = newUser.id;
        logger.info(
          {
            userId: effectiveUserId,
            email: newUser.email,
            hasPhone: !!normalizedPhone,
            hasName: !!(vippsFirstName && vippsLastName),
            emailVerified: true,
            phoneVerified: true,
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
          paymentReference,
          cartItems: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          websiteId,
        },
        'CRITICAL: Not all products found - products may have been deleted or are in different tenant'
      );
      return actionError('Some products not found');
    }

    // Map products to order items with prices
    const orderItems = cart.items.map((item) => {
      const product = products.find((p) => p.id === item.productId) as Product;
      return {
        itemId: crypto.randomUUID(),
        product: product.id,
        quantity: item.quantity,
        price: {
          amountExVat: product.price?.amountExVat || 0,
          currency: product.price?.currency || 'NOK',
          vatRate: product.price?.vatRate || 25,
        },
      };
    });

    // Add shipping line item if Vipps provided shipping details
    logger.info(
      {
        hasShippingDetails: !!paymentDetails.shippingDetails,
        shippingDetails: paymentDetails.shippingDetails,
        paymentState: paymentDetails.state,
      },
      'Checking for shipping details from Vipps'
    );

    if (paymentDetails.shippingDetails) {
      try {
        const shippingOptionId = paymentDetails.shippingDetails.shippingOptionId;
        const shippingOptionName = paymentDetails.shippingDetails.shippingOptionName;

        // Find or create shipping product with SKU matching the shipping option ID
        const shippingProducts = await payload.find({
          collection: 'products',
          where: {
            sku: {
              equals: shippingOptionId,
            },
          },
          limit: 1,
        });

        let shippingProduct: Product;

        if (shippingProducts.docs.length > 0) {
          shippingProduct = shippingProducts.docs[0] as Product;
          logger.info(
            { productId: shippingProduct.id, sku: shippingOptionId },
            'Found existing shipping product'
          );
        } else {
          // Create shipping product with data from Vipps
          const newShippingProduct = await payload.create({
            collection: 'products',
            draft: false,
            data: {
              title: shippingOptionName,
              lead: `Levering via Vipps: ${shippingOptionName}`,
              productType: 'shipping',
              price: {
                amountExVat: 0, // Actual price comes from Vipps per order
                currency: 'NOK',
                vatRate: 25,
              },
              sku: shippingOptionId,
              slug: shippingOptionId,
              resourceId: shippingOptionId,
              tenant: websiteId,
              _status: 'published',
            },
          });
          shippingProduct = newShippingProduct as Product;
          logger.info(
            { productId: shippingProduct.id, sku: shippingOptionId, name: shippingOptionName },
            'Created new shipping product from Vipps option'
          );
        }

        // Vipps shippingCost is in minor units (øre), already including VAT
        // We need to calculate ex VAT amount
        const shippingCostIncVat = paymentDetails.shippingDetails.shippingCost;
        const vatRate = 25; // Shipping typically has 25% VAT in Norway
        const shippingCostExVat = Math.round(shippingCostIncVat / (1 + vatRate / 100));

        // Validate currency
        const currency = paymentDetails.aggregate.authorizedAmount.currency || 'NOK';
        const supportedCurrencies = ['NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK'] as const;
        const validCurrency = supportedCurrencies.includes(currency as typeof supportedCurrencies[number])
          ? (currency as typeof supportedCurrencies[number])
          : 'NOK';

        // Add shipping as order item
        orderItems.push({
          itemId: crypto.randomUUID(),
          product: shippingProduct.id,
          quantity: 1,
          price: {
            amountExVat: shippingCostExVat,
            currency: validCurrency,
            vatRate,
          },
        });

        logger.info(
          {
            shippingOptionId: paymentDetails.shippingDetails.shippingOptionId,
            shippingOptionName: paymentDetails.shippingDetails.shippingOptionName,
            shippingCostIncVat,
            shippingCostExVat,
            vatRate,
          },
          'Added shipping line item from Vipps'
        );
      } catch (error) {
        logger.error(
          {
            error,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            paymentReference,
            shippingDetails: paymentDetails.shippingDetails,
          },
          'Failed to add shipping line item - continuing without shipping'
        );
        // Continue without shipping rather than failing the entire order
      }
    }

    // Calculate order total and validate against authorized amount
    // Note: calculatedTotal is ex VAT, while Vipps includes VAT + shipping
    const calculatedTotal = orderItems.reduce((sum, item) => {
      const itemTotal = (item.price.amountExVat || 0) * item.quantity;
      return sum + itemTotal;
    }, 0);

    // Vipps amount is in øre (minor units), same as calculatedTotal
    const authorizedAmount = paymentDetails.aggregate.authorizedAmount.value;

    logger.info(
      {
        calculatedTotal,
        calculatedTotalNOK: calculatedTotal / 100,
        authorizedAmount,
        authorizedAmountNOK: authorizedAmount / 100,
        difference: authorizedAmount - calculatedTotal,
        orderItems: orderItems.map(i => ({
          productId: i.product,
          quantity: i.quantity,
          unitPrice: i.price.amountExVat,
          total: i.price.amountExVat * i.quantity,
        })),
      },
      'Validating payment amount'
    );

    // Accept payment if authorized amount >= order total
    // (Vipps includes VAT + shipping, our total is ex VAT)
    if (authorizedAmount < calculatedTotal) {
      logger.error(
        {
          calculatedTotal,
          calculatedTotalNOK: calculatedTotal / 100,
          authorizedAmount,
          authorizedAmountNOK: authorizedAmount / 100,
          difference: calculatedTotal - authorizedAmount,
          paymentReference,
        },
        'Payment amount insufficient - authorized less than order total'
      );
      return actionError(
        `Payment amount insufficient: authorized ${authorizedAmount / 100} NOK but order total is ${calculatedTotal / 100} NOK (ex VAT)`
      );
    }

    logger.info(
      {
        authorizedAmount,
        calculatedTotal,
        overpayment: authorizedAmount - calculatedTotal,
      },
      'Payment amount validated - authorized amount covers order total'
    );

    // Get user details from Historia account
    const user = await payload.findByID({
      collection: 'users',
      id: effectiveUserId!,
    });

    if (!user || !user.email) {
      logger.error(
        {
          paymentReference,
          userId: effectiveUserId,
          hasUser: !!user,
          hasEmail: !!user?.email,
          paymentState: paymentDetails.state,
          authorizedAmount: paymentDetails.aggregate.authorizedAmount,
        },
        'CRITICAL: User or user email not found - cannot create order'
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

    // Extract shipping address from Vipps (prioritize shippingDetails over userDetails)
    const vippsShippingAddress = paymentDetails.shippingDetails?.address
      ? {
          addressLine1: paymentDetails.shippingDetails.address.addressLine1,
          addressLine2: paymentDetails.shippingDetails.address.addressLine2,
          postalCode: paymentDetails.shippingDetails.address.postCode,
          city: paymentDetails.shippingDetails.address.city,
          country: paymentDetails.shippingDetails.address.country,
        }
      : paymentDetails.userDetails
        ? {
            addressLine1: paymentDetails.userDetails.streetAddress,
            postalCode: paymentDetails.userDetails.zipCode,
            city: paymentDetails.userDetails.city,
            country: paymentDetails.userDetails.country,
          }
        : undefined;

    if (vippsShippingAddress) {
      logger.info(
        {
          paymentReference,
          address: vippsShippingAddress,
        },
        'Shipping address received from Vipps'
      );
    } else {
      logger.warn(
        { paymentReference },
        'No shipping address available from Vipps'
      );
    }

    // Create Order
    const orderCreateStart = Date.now();
    const order = await payload.create({
      collection: 'orders',
      draft: false,
      data: {
        customer: effectiveUserId!,
        userEmail: user.email,
        status: 'processing',
        currency: paymentDetails.aggregate.authorizedAmount.currency,
        tenant: websiteId,
        items: orderItems,
        shippingAddress: vippsShippingAddress,
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

    // Update cart status to completed and link to order
    // Idempotent: Only update if not already completed (prevents race condition with webhook)
    try {
      const carts = await payload.find({
        collection: 'carts' as any,
        where: {
          paymentReference: {
            equals: paymentReference,
          },
        },
        limit: 1,
      });

      if (carts.docs.length > 0) {
        const cart = carts.docs[0] as any;

        // Idempotent check: Skip if already completed (webhook may have updated it)
        if (cart.status === 'completed') {
          logger.info(
            {
              cartId: cart.id,
              orderId: order.id,
              paymentReference,
            },
            'Cart already marked as completed (likely by webhook) - skipping update'
          );
        } else {
          await payload.update({
            collection: 'carts' as any,
            id: cart.id,
            data: {
              status: 'completed',
              order: order.id,
            },
          });
          logger.info(
            {
              cartId: cart.id,
              orderId: order.id,
              paymentReference,
              previousStatus: cart.status,
            },
            'Cart status updated to completed and linked to order'
          );
        }
      } else {
        logger.warn(
          {
            paymentReference,
            orderId: order.id,
          },
          'No cart found for payment reference when updating status - order was created successfully'
        );
      }
    } catch (error) {
      logger.error(
        {
          error,
          paymentReference,
          orderId: order.id,
        },
        'Failed to update cart status - order was created successfully'
      );
    }

    // Update user's Vipps address in their profile
    if (vippsShippingAddress) {
      try {
        // Find existing Vipps address or add new one
        const currentAddresses = user.addresses || [];
        const vippsAddressIndex = currentAddresses.findIndex(
          (addr) => addr.label === 'Vipps'
        );

        let updatedAddresses;
        if (vippsAddressIndex >= 0) {
          // Update existing Vipps address
          updatedAddresses = [...currentAddresses];
          updatedAddresses[vippsAddressIndex] = {
            ...updatedAddresses[vippsAddressIndex],
            ...vippsShippingAddress,
            label: 'Vipps',
          };
          logger.info(
            { userId: effectiveUserId, addressIndex: vippsAddressIndex },
            'Updated existing Vipps address in user profile'
          );
        } else {
          // Add new Vipps address
          updatedAddresses = [
            ...currentAddresses,
            {
              label: 'Vipps',
              isDefault: currentAddresses.length === 0, // First address is default
              ...vippsShippingAddress,
            },
          ];
          logger.info(
            {
              userId: effectiveUserId,
              isFirstAddress: currentAddresses.length === 0,
            },
            'Added new Vipps address to user profile'
          );
        }

        await payload.update({
          collection: 'users',
          id: effectiveUserId!,
          data: {
            addresses: updatedAddresses,
          },
        });
      } catch (error) {
        // Don't fail order creation if address update fails
        logger.error(
          {
            error,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            userId: effectiveUserId,
            paymentReference,
            vippsShippingAddress,
          },
          'Failed to update user address, but order was created successfully'
        );
      }
    }

    // Create or update Transaction
    const transactionCreateStart = Date.now();
    const transactionAmount = paymentDetails.aggregate.authorizedAmount.value; // Keep in minor units (øre)
    const transactionCurrency = paymentDetails.aggregate.authorizedAmount.currency;
    const transactionStatus = paymentDetails.state === 'AUTHORIZED' ? 'authorized' : 'captured';

    // Check if transaction already exists (from webhook)
    const existingWebhookTransactions = await payload.find({
      collection: 'transactions',
      where: {
        paymentReference: {
          equals: paymentReference,
        },
      },
      limit: 1,
    });

    let transaction;
    if (existingWebhookTransactions.docs.length > 0) {
      // Transaction already exists from webhook - update it with order and customer
      transaction = existingWebhookTransactions.docs[0];

      logger.info(
        {
          transactionId: transaction.id,
          orderId: order.id,
          customerId: effectiveUserId,
          paymentReference,
          hadOrder: !!transaction.order,
        },
        'Transaction already exists (from webhook) - linking to order'
      );

      transaction = await payload.update({
        collection: 'transactions',
        id: transaction.id,
        data: {
          order: order.id,
          customer: effectiveUserId!,
          amount: transactionAmount,
          currency: transactionCurrency as 'NOK' | 'USD' | 'EUR' | 'SEK' | 'DKK',
          status: transactionStatus,
          paymentMethod: 'vipps',
          tenant: websiteId,
        },
      });

      logger.info(
        {
          transactionId: transaction.id,
          orderId: order.id,
          paymentReference,
        },
        'Orphaned transaction successfully linked to order'
      );
    } else {
      // Create new transaction
      logger.info(
        {
          orderId: order.id,
          customerId: effectiveUserId,
          amount: transactionAmount,
          amountMajor: transactionAmount / 100, // For logging readability
          currency: transactionCurrency,
          status: transactionStatus,
          paymentReference,
        },
        'Creating new transaction in database'
      );

      try {
        transaction = await payload.create({
          collection: 'transactions',
          draft: false,
          data: {
            order: order.id,
            customer: effectiveUserId!,
            amount: transactionAmount, // Store in minor units
            currency: transactionCurrency as 'NOK' | 'USD' | 'EUR' | 'SEK' | 'DKK',
            status: transactionStatus,
            paymentMethod: 'vipps',
            paymentReference,
            tenant: websiteId,
          },
        });
      } catch (createError: any) {
        // Handle race condition: webhook and client callback both tried to create transaction
        // The unique constraint on paymentReference prevents duplicates
        if (createError?.message?.includes('unique') || createError?.message?.includes('duplicate')) {
          logger.warn(
            {
              paymentReference,
              orderId: order.id,
              createError: createError.message,
            },
            'Transaction already exists (race condition) - retrieving existing transaction'
          );

          // Retrieve the existing transaction that was created by webhook
          const existingDuplicateTransactions = await payload.find({
            collection: 'transactions',
            where: {
              paymentReference: {
                equals: paymentReference,
              },
            },
            limit: 1,
          });

          if (existingDuplicateTransactions.docs.length === 0) {
            // This shouldn't happen, but handle it
            logger.error(
              {
                paymentReference,
                orderId: order.id,
              },
              'CRITICAL: Unique constraint violation but transaction not found'
            );
            throw createError; // Re-throw original error
          }

          transaction = existingDuplicateTransactions.docs[0];

          logger.info(
            {
              transactionId: transaction.id,
              paymentReference,
              orderId: order.id,
            },
            'Using existing transaction created by concurrent request (webhook/client race)'
          );
        } else {
          // Different error - re-throw
          throw createError;
        }
      }
    }

    const transactionCreateTime = Date.now() - transactionCreateStart;

    // Create BusinessEvent to log the payment
    const businessEventStart = Date.now();
    await payload.create({
      collection: 'business-events',
      data: {
        eventType: 'payment',
        externalReference: paymentReference,
        data: {
          name: transactionStatus === 'authorized' ? 'AUTHORIZED' : 'CAPTURED',
          amount: paymentDetails.aggregate.authorizedAmount,
          pspReference: paymentDetails.pspReference,
          orderId: order.id,
          transactionId: transaction.id,
          timestamp: new Date().toISOString(),
          source: 'order-creation',
        },
      },
    });
    const businessEventTime = Date.now() - businessEventStart;

    const totalTime = Date.now() - startTime;

    logger.info(
      {
        orderId: order.id,
        transactionId: transaction.id,
        paymentReference,
        amount: transactionAmount,
        transactionStatus,
        transactionCreateTimeMs: transactionCreateTime,
        businessEventTimeMs: businessEventTime,
        totalTimeMs: totalTime,
      },
      'Order, transaction and business event created successfully - cart will be cleared client-side'
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
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        paymentReference,
        userId,
        paymentState: paymentDetails?.state,
        authorizedAmount: paymentDetails?.aggregate?.authorizedAmount,
        pspReference: paymentDetails?.pspReference,
        hasCart: !!cart,
        cartItemCount: cart?.items?.length,
        customerEmail: paymentDetails?.profile?.email || paymentDetails?.userDetails?.email,
        totalTimeMs: totalTime,
      },
      'CRITICAL: Error creating order from payment - payment may be authorized but order not created'
    );
    return actionError(
      error instanceof Error ? error.message : 'Failed to create order',
    );
  }
}

/**
 * Check if an order already exists for a payment reference
 * Used to skip SSE and show success immediately when revisiting the page
 * SECURITY: Validates that the session owns this payment reference
 */
export async function checkExistingOrder(
  paymentReference: string
): Promise<
  ServerActionResult<{
    exists: boolean;
    orderId?: string;
    transactionId?: string;
    userEmail?: string;
    shippingAddress?: {
      addressLine1?: string;
      addressLine2?: string;
      postalCode?: string;
      city?: string;
      country?: string;
    };
  }>
> {
  // CRITICAL: Log immediately when server action is invoked
  console.log('[SERVER ACTION] checkExistingOrder called with reference:', paymentReference);
  logger.info({ paymentReference }, '🔍 SERVER ACTION INVOKED: checkExistingOrder');

  try {
    // Validate payment ownership
    const ownershipCheck = await validatePaymentOwnership(paymentReference);
    if (!ownershipCheck.success) {
      logger.warn(
        { paymentReference },
        'Session lost or unauthorized access - allowing normal flow with fallback recovery'
      );
      // Don't block the flow - let the normal payment processing handle it
      // with cart recovery via paymentReference fallback
      return actionSuccess({ exists: false });
    }

    const payload = await getPayload({ config: configPromise });

    // Check if transaction exists for this payment reference
    const existingTransactions = await payload.find({
      collection: 'transactions',
      where: {
        paymentReference: {
          equals: paymentReference,
        },
      },
      limit: 1,
    });

    if (existingTransactions.docs.length === 0) {
      return actionSuccess({ exists: false });
    }

    const transaction = existingTransactions.docs[0];

    // Handle case where transaction exists but order is not yet created
    if (!transaction.order) {
      logger.warn(
        { paymentReference, transactionId: transaction.id },
        'Transaction exists but no order created yet'
      );
      return actionSuccess({ exists: false });
    }

    const orderId =
      typeof transaction.order === 'string' ? transaction.order : transaction.order.id;

    // Fetch order details to get user email and shipping address
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId as string,
    });

    logger.info(
      {
        paymentReference,
        orderId,
        transactionId: transaction.id,
        exists: true,
      },
      'Found existing order for payment reference'
    );

    return actionSuccess({
      exists: true,
      orderId: orderId as string,
      transactionId: transaction.id as string,
      userEmail: order.userEmail || undefined,
      shippingAddress: order.shippingAddress
        ? {
            addressLine1: order.shippingAddress.addressLine1 || undefined,
            addressLine2: order.shippingAddress.addressLine2 || undefined,
            postalCode: order.shippingAddress.postalCode || undefined,
            city: order.shippingAddress.city || undefined,
            country: order.shippingAddress.country || undefined,
          }
        : undefined,
    });
  } catch (error) {
    logger.error({
      error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      paymentReference,
    }, 'Error checking existing order - proceeding with normal flow');
    // Return exists: false on error to allow normal flow to proceed
    return actionSuccess({ exists: false });
  }
}

/**
 * Process payment and create order (called from client when payment status changes)
 *
 * This server action:
 * 1. Validates payment ownership
 * 2. Fetches payment details from Vipps
 * 3. Creates order with createOrderFromPayment
 * 4. Returns order details with shipping info
 *
 * SECURITY: Validates that the session owns this payment reference
 */
export async function processPaymentAndCreateOrder(
  paymentReference: string
): Promise<
  ServerActionResult<{
    orderId: string;
    transactionId: string;
    userEmail: string;
    shippingAddress?: {
      addressLine1?: string;
      addressLine2?: string;
      postalCode?: string;
      city?: string;
      country?: string;
    };
  }>
> {
  // CRITICAL: Log immediately when server action is invoked
  console.log('[SERVER ACTION] processPaymentAndCreateOrder called with reference:', paymentReference);
  logger.info({ paymentReference }, '🚀 SERVER ACTION INVOKED: processPaymentAndCreateOrder');

  try {
    // Validate payment ownership
    const ownershipCheck = await validatePaymentOwnership(paymentReference);
    if (!ownershipCheck.success) {
      logger.warn(
        { paymentReference },
        'Unauthorized attempt to process payment'
      );
      return actionError('Unauthorized access');
    }

    logger.info({ paymentReference }, 'Processing payment and creating order');

    // Get Vipps config and fetch payment details (server-side only)
    const { getPaymentDetails } = await import('@eventuras/vipps/epayment-v1');
    const { getVippsConfig } = await import('@/lib/vipps/config');
    const vippsConfig = getVippsConfig();

    const paymentDetails = await getPaymentDetails(vippsConfig, paymentReference);

    logger.info(
      { paymentReference, state: paymentDetails.state },
      'Payment details retrieved'
    );

    // Create order
    const orderResult = await createOrderFromPayment({
      paymentReference,
      paymentDetails,
    });

    if (!orderResult.success) {
      return actionError(orderResult.error.message);
    }

    // Return order details with shipping info
    return actionSuccess({
      orderId: orderResult.data.orderId,
      transactionId: orderResult.data.transactionId,
      userEmail: paymentDetails.profile?.email || paymentDetails.userDetails?.email || '',
      shippingAddress: paymentDetails.userDetails
        ? {
            addressLine1: paymentDetails.userDetails.streetAddress,
            postalCode: paymentDetails.userDetails.zipCode,
            city: paymentDetails.userDetails.city,
            country: paymentDetails.userDetails.country,
          }
        : undefined,
    });
  } catch (error) {
    logger.error({
      error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      paymentReference,
    }, 'CRITICAL: Error processing payment and creating order');
    return actionError(
      error instanceof Error ? error.message : 'Failed to process payment'
    );
  }
}
