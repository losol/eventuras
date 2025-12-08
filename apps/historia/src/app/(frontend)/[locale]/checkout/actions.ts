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
  namespace: 'historia:cart',
  context: { module: 'cartActions' },
});

/**
 * Cart line item with all calculations done server-side
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

    logger.info({ cartItems }, 'Calculating cart totals');

    const payload = await getPayload({ config: configPromise });

    // Fetch all products
    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: cartItems.map((item) => item.productId),
        },
      },
      limit: cartItems.length,
    });

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

    logger.info(
      {
        itemCount: items.length,
        subtotalExVat,
        totalVat,
        totalIncVat: summary.totalIncVat,
        currency,
      },
      'Cart totals calculated',
    );

    return actionSuccess(summary);
  } catch (error) {
    logger.error({ error, cartItems }, 'Failed to calculate cart totals');
    return actionError(
      error instanceof Error ? error.message : 'Failed to calculate cart',
    );
  }
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

    logger.info({ itemCount: cartItems.length }, 'Validating cart products');

    const payload = await getPayload({ config: configPromise });

    // Fetch all products
    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: cartItems.map((item) => item.productId),
        },
      },
      limit: cartItems.length,
    });

    const foundProductIds = new Set(products.map((p) => p.id));
    const requestedProductIds = cartItems.map((item) => item.productId);

    const invalidProductIds = requestedProductIds.filter((id) => !foundProductIds.has(id));
    const validProductIds = requestedProductIds.filter((id) => foundProductIds.has(id));

    if (invalidProductIds.length > 0) {
      logger.warn(
        {
          invalidCount: invalidProductIds.length,
          invalidProductIds,
          totalRequested: requestedProductIds.length,
        },
        'Found invalid products in cart'
      );
    } else {
      logger.info({ validCount: validProductIds.length }, 'All cart products are valid');
    }

    return actionSuccess({ invalidProductIds, validProductIds });
  } catch (error) {
    logger.error({ error, cartItems }, 'Failed to validate cart products');
    return actionError(
      error instanceof Error ? error.message : 'Failed to validate cart',
    );
  }
}

/**
 * Fetch product details for cart items
 * @param productIds - Array of product IDs to fetch
 * @returns Array of products or error
 * @deprecated Use calculateCart instead for cart display
 */
export async function getCartProducts(
  productIds: string[],
): Promise<ServerActionResult<Product[]>> {
  try {
    if (!productIds.length) {
      return actionSuccess([]);
    }

    logger.info({ productIds }, 'Fetching cart products');

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

    logger.info(
      { count: docs.length, productIds },
      'Successfully fetched cart products',
    );

    return actionSuccess(docs);
  } catch (error) {
    logger.error({ error, productIds }, 'Failed to fetch cart products');
    return actionError(
      error instanceof Error ? error.message : 'Failed to fetch products',
    );
  }
}
