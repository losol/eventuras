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
 * Fetch product details for cart items
 * @param productIds - Array of product IDs to fetch
 * @returns Array of products or error
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
