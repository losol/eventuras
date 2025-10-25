'use server';

import { revalidatePath } from 'next/cache';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import type { NewProductDto, ProductDto } from '@/lib/eventuras-sdk';
import {
  getV3EventsByEventIdProducts,
  postV3EventsByEventIdProducts,
  putV3EventsByEventIdProductsByProductId,
} from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:admin:products',
  context: { module: 'ProductActions' },
});

/**
 * Fetch all products for an event
 */
export async function fetchEventProducts(
  eventId: number
): Promise<ServerActionResult<ProductDto[]>> {
  logger.info({ eventId }, 'Fetching products for event');

  try {
    const response = await getV3EventsByEventIdProducts({
      path: { eventId },
    });

    if (!response.data) {
      logger.error(
        {
          error: response.error,
          eventId,
        },
        'Failed to fetch products'
      );
      return actionError('Failed to fetch products');
    }

    logger.info({ eventId, count: response.data.length }, 'Products fetched successfully');
    return actionSuccess(response.data);
  } catch (error) {
    logger.error({ error, eventId }, 'Unexpected error fetching products');
    return actionError('An unexpected error occurred');
  }
}

/**
 * Create a new product for an event
 */
export async function createProduct(
  eventId: number,
  data: NewProductDto
): Promise<ServerActionResult<ProductDto>> {
  logger.info({ eventId, productName: data.name }, 'Creating product');

  try {
    const response = await postV3EventsByEventIdProducts({
      path: { eventId },
      body: data,
    });

    if (!response.data) {
      logger.error(
        {
          error: response.error,
          eventId,
          input: data,
        },
        'Failed to create product'
      );
      return actionError('Failed to create product');
    }

    const product = response.data as ProductDto;

    // Revalidate caches to show the new product
    revalidatePath(`/admin/events/${eventId}/products`); // Admin products page
    revalidatePath(`/events/${eventId}`); // Public event detail page (shows products)
    revalidatePath('/'); // Frontpage (might show product info in event cards)

    logger.info(
      { eventId, productId: product.productId, productName: product.name },
      'Product created successfully'
    );
    return actionSuccess(product, 'Product was created!');
  } catch (error) {
    logger.error({ error, eventId, input: data }, 'Unexpected error creating product');
    return actionError('An unexpected error occurred');
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  eventId: number,
  productId: number,
  data: ProductDto
): Promise<ServerActionResult<ProductDto>> {
  logger.info({ eventId, productId, productName: data.name }, 'Updating product');

  try {
    const response = await putV3EventsByEventIdProductsByProductId({
      path: { eventId, productId },
      body: data,
    });

    if (!response.data) {
      logger.error(
        {
          error: response.error,
          eventId,
          productId,
          input: data,
        },
        'Failed to update product'
      );
      return actionError('Failed to update product');
    }

    const product = response.data as ProductDto;

    // Revalidate caches to show the updated product
    revalidatePath(`/admin/events/${eventId}/products`); // Admin products page
    revalidatePath(`/events/${eventId}`); // Public event detail page (shows products)
    revalidatePath('/'); // Frontpage (might show product info in event cards)

    logger.info({ eventId, productId }, 'Product updated successfully');
    return actionSuccess(product, 'Product was updated!');
  } catch (error) {
    logger.error({ error, eventId, productId, input: data }, 'Unexpected error updating product');
    return actionError('An unexpected error occurred');
  }
}
