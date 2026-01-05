'use server';

import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { getCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';
import {
  createPayment,
  type CreatePaymentRequest,
  type CreatePaymentResponse,
  getPaymentDetails,
  type PaymentDetails,
} from '@eventuras/vipps/epayment-v1';

import { setCartPaymentReference } from '@/app/actions/cart';
import { appConfig } from '@/config.server';
import { saveCartToDatabase } from '@/lib/cart/saveCartToDatabase';
import { SHIPPING_OPTIONS } from '@/lib/shipping/options';
import { getVippsConfig } from '@/lib/vipps/config';
import type { Product } from '@/payload-types';
import { getMeUser } from '@/utilities/getMeUser';

const logger = Logger.create({
  namespace: 'historia:checkout',
  context: { module: 'checkoutActions' },
});

/**
 * Cart line item details with price and VAT calculations
 */
export interface CartLineItem {
  productId: string;
  title: string;
  quantity: number;
  pricePerUnit: number; // ex VAT, in minor units
  pricePerUnitIncVat: number; // inc VAT, in minor units
  lineTotal: number; // ex VAT, in minor units
  vatRate: number; // percentage
  vatAmount: number; // VAT for one unit, in minor units
  vatAmountTotal: number; // Total VAT for line, in minor units
  lineTotalIncVat: number; // in minor units
  currency: string;
}

/**
 * Complete cart summary with all calculations
 */
export interface CartSummary {
  items: CartLineItem[];
  subtotalExVat: number; // in minor units
  totalVat: number; // in minor units
  totalIncVat: number; // in minor units
  currency: string;
}

/**
 * Calculate cart summary with all prices and VAT
 * All calculations done server-side for security and consistency
 */
export async function calculateCart(
  cartItems: Array<{ productId: string; quantity: number }>,
): Promise<ServerActionResult<CartSummary>> {
  try {
    if (!cartItems.length) {
      return actionSuccess({
        items: [],
        subtotalExVat: 0,
        totalVat: 0,
        totalIncVat: 0,
        currency: 'NOK',
      });
    }

    const products = await fetchProductsByIds(cartItems.map((item) => item.productId));

    // Build line items with calculations
    const items: CartLineItem[] = [];
    let subtotalExVat = 0;
    let totalVat = 0;
    const currency = products[0]?.price?.currency || 'NOK';

    for (const cartItem of cartItems) {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) {
        logger.warn({ productId: cartItem.productId }, 'Product not found in cart');
        continue;
      }

      // Use virtual fields from Product collection
      const pricePerUnit = product.price?.amountExVat ?? 0;
      const pricePerUnitIncVat = product.price?.amountIncVat ?? pricePerUnit;
      const vatAmountPerUnit = product.price?.vatAmount ?? 0;
      const vatRate = product.price?.vatRate ?? 25;

      const lineTotal = pricePerUnit * cartItem.quantity;
      const vatAmountTotal = vatAmountPerUnit * cartItem.quantity;
      const lineTotalIncVat = pricePerUnitIncVat * cartItem.quantity;

      items.push({
        productId: product.id,
        title: product.title || 'Untitled',
        quantity: cartItem.quantity,
        pricePerUnit,
        pricePerUnitIncVat,
        lineTotal,
        vatRate,
        vatAmount: vatAmountPerUnit,
        vatAmountTotal,
        lineTotalIncVat,
        currency: product.price?.currency || 'NOK',
      });

      subtotalExVat += lineTotal;
      totalVat += vatAmountTotal;
    }

    const summary: CartSummary = {
      items,
      subtotalExVat,
      totalVat,
      totalIncVat: subtotalExVat + totalVat,
      currency,
    };

    return actionSuccess(summary);
  } catch (error) {
    logger.error({ error, cartItems }, 'Failed to calculate cart totals');
    return actionError(
      error instanceof Error ? error.message : 'Failed to calculate cart',
    );
  }
}

/**
 * Fetch products by IDs (internal helper)
 */
async function fetchProductsByIds(productIds: string[]): Promise<Product[]> {
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      id: {
        in: productIds,
      },
    },
    limit: productIds.length,
  });

  return docs;
}

/**
 * Validate cart items and identify products that no longer exist
 * Returns list of invalid product IDs that should be removed from cart
 */
export async function validateCartProducts(
  cartItems: Array<{ productId: string; quantity: number }>,
): Promise<ServerActionResult<{ invalidProductIds: string[]; validProductIds: string[] }>> {
  try {
    if (!cartItems.length) {
      return actionSuccess({ invalidProductIds: [], validProductIds: [] });
    }

    const products = await fetchProductsByIds(cartItems.map((item) => item.productId));

    const foundProductIds = new Set(products.map((p) => p.id));
    const requestedProductIds = cartItems.map((item) => item.productId);

    const invalidProductIds = requestedProductIds.filter((id) => !foundProductIds.has(id));
    const validProductIds = requestedProductIds.filter((id) => foundProductIds.has(id));

    if (invalidProductIds.length > 0) {
      logger.warn({ invalidProductIds }, 'Invalid products in cart');
    }

    return actionSuccess({ invalidProductIds, validProductIds });
  } catch (error) {
    logger.error({ error, cartItems }, 'Failed to validate cart products');
    return actionError(
      error instanceof Error ? error.message : 'Failed to validate cart',
    );
  }
}

// ============================================================================
// Vipps Payment Actions
// ============================================================================

interface CreateVippsPaymentParams {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  userLanguage?: string;
}

/**
 * Create Vipps ePayment (WEB_REDIRECT flow)
 * Uses the new ePayment API instead of the old Checkout API
 * All price calculations are done server-side
 */
export async function createVippsPayment({
  items,
  userLanguage = 'no',
}: CreateVippsPaymentParams): Promise<ServerActionResult<CreatePaymentResponse>> {
  try {
    // STEP 1: Save cart to database for secure payment validation
    // This ensures cart persists during payment flow even if session expires
    const saveResult = await saveCartToDatabase();
    if (!saveResult.success) {
      logger.error(
        { error: saveResult.error },
        'Failed to save cart to database',
      );
      return actionError(
        'Failed to save cart to database',
      );
    }

    const { cartId, cartSecret } = saveResult.data;
    logger.info({ cartId }, 'Cart saved to database successfully');

    // STEP 2: Calculate cart totals server-side
    const cartResult = await calculateCart(items);
    if (!cartResult.success) {
      logger.error({ error: cartResult.error }, 'Failed to calculate cart');
      return actionError('Kunne ikke beregne handlekurv');
    }

    const cart: CartSummary = cartResult.data;

    // Try to get current user for phone number (optional)
    let phoneNumber: string | undefined;
    try {
      const userResult = await getMeUser();
      const rawPhone = userResult?.user?.phone_number;
      if (rawPhone) {
        // Normalize phone number: remove +, spaces, and other non-digits
        // Vipps requires 9-15 digits WITH country code (e.g., 4712345678)
        phoneNumber = rawPhone.replace(/\D/g, '');

        // Validate length (9-15 digits)
        if (phoneNumber.length < 9 || phoneNumber.length > 15) {
          phoneNumber = undefined;
        }
      }
    } catch {
      // No user session, continue without phone pre-fill
    }

    // Generate unique payment reference using UUID
    const reference = crypto.randomUUID();

    // Build payment description from cart items
    const productNames = cart.items.map((item) => item.title).join(', ');
    const paymentDescription =
      cart.items.length > 0
        ? `Kjøp: ${productNames.substring(0, 100)}`
        : `Ordre ${reference}`;

    // Build order lines from calculated cart
    const orderLines = cart.items.map((item) => ({
      name: item.title,
      id: item.productId,
      totalAmount: item.lineTotalIncVat,
      totalAmountExcludingTax: item.lineTotal,
      totalTaxAmount: item.vatAmount,
      taxRate: item.vatRate * 100, // Vipps expects taxRate in basis points (25% = 2500)
    }));

    // Total amount without shipping (Vipps will add shipping cost)
    const totalAmount = cart.totalIncVat;

    // Get current host for dynamic callback URL
    // This ensures the callback returns to the same domain where payment was initiated
    const headersList = await headers();
    const host = headersList.get('host');
    const forwardedProto = headersList.get('x-forwarded-proto');
    const protocol =
      forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const baseUrl = host ? `${protocol}://${host}` : appConfig.env.NEXT_PUBLIC_CMS_URL;

    logger.info(
      { host, baseUrl, reference },
      'Building payment with dynamic callback URL'
    );

    // Build ePayment request
    const paymentRequest: CreatePaymentRequest = {
      amount: {
        value: totalAmount,
        currency: cart.currency,
      },
      paymentMethod: {
        type: 'WALLET',
      },
      customer: phoneNumber
        ? {
            phoneNumber,
          }
        : undefined,
      profile: {
        scope: 'name phoneNumber address email',
      },
      reference,
      returnUrl: `${baseUrl}/${userLanguage}/checkout/vipps?reference=${reference}`,
      userFlow: 'WEB_REDIRECT',
      paymentDescription,
      receipt: {
        orderLines,
        bottomLine: {
          currency: cart.currency,
        },
      },
      shipping: {
        fixedOptions: SHIPPING_OPTIONS.map((option, index) => ({
          brand: option.brand,
          type: option.type,
          isDefault: index === 0,
          priority: index,
          options: [
            {
              id: option.id,
              amount: {
                value: option.price,
                currency: cart.currency,
              },
              name: option.name,
              isDefault: index === 0,
              priority: 0,
            },
          ],
        })),
      },
    };

    // Get Vipps configuration
    const vippsConfig = getVippsConfig();

    // Create payment using ePayment API client
    const paymentResponse = await createPayment(vippsConfig, paymentRequest);

    // Store payment reference in cart session
    await setCartPaymentReference(reference);

    // Update cart in database with payment reference and status for recovery if session is lost
    try {
      const payload = await getPayload({ config: configPromise });
      await payload.update({
        collection: 'carts' as any,
        id: cartId,
        data: {
          paymentReference: reference,
          status: 'payment-initiated',
        },
        overrideAccess: true, // We have the cartId from saveCartToDatabase
      });
      logger.debug({ cartId, reference }, 'Cart updated with payment reference and status=payment-initiated');
    } catch (error) {
      // Non-critical - cart can still be recovered via session
      logger.warn({ error, cartId, reference }, 'Failed to update cart with payment reference and status');
    }

    logger.info({ reference }, 'Vipps payment created');

    return actionSuccess(paymentResponse);
  } catch (error) {
    logger.error(
      {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'Error creating Vipps ePayment',
    );
    return actionError('Kunne ikke starte betaling. Prøv igjen om litt.');
  }
}

/**
 * Check if there's a pending payment for the current cart
 *
 * This is useful when user returns to checkout page after starting a payment
 * but didn't complete it or got lost along the way.
 *
 * @returns Payment details if there's a pending/authorized payment, null otherwise
 */
export async function checkPendingPayment(): Promise<
  ServerActionResult<PaymentDetails | null>
> {
  try {
    const session = await getCurrentSession();
    const cart = session?.data?.cart;

    if (!cart?.paymentReference) {
      return actionSuccess(null);
    }

    const reference = cart.paymentReference;

    const vippsConfig = getVippsConfig();
    const paymentDetails = await getPaymentDetails(vippsConfig, reference);

    // Only return payment if it's in a state where user can continue
    if (
      paymentDetails.state === 'CREATED' ||
      paymentDetails.state === 'AUTHORIZED'
    ) {
      return actionSuccess(paymentDetails);
    }

    // Payment is in terminal state (ABORTED, EXPIRED, TERMINATED), allow new payment
    return actionSuccess(null);
  } catch {
    // Payment not found or error - allow new payment
    return actionSuccess(null);
  }
}
