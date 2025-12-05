import type { CollectionBeforeChangeHook } from 'payload';

import type { Order, Product } from '@/payload-types';

/**
 * Hook to populate order item prices from products
 * This ensures prices are locked at order creation time
 */
export const populateOrderPrices: CollectionBeforeChangeHook<Order> = async ({
  data,
  req,
  operation,
}) => {
  // Only populate prices on create
  if (operation !== 'create') {
    return data;
  }

  if (!data?.items || !Array.isArray(data.items)) {
    return data;
  }

  // Fetch prices from products and populate items
  const itemsWithPrices = await Promise.all(
    data.items.map(async (item) => {
      // Skip if price is already set (manual override)
      if (item.price?.amount) {
        return item;
      }

      // Get product ID
      const productId = typeof item.product === 'string' ? item.product : item.product?.id;

      if (!productId) {
        return item;
      }

      // Fetch product from database
      const product = await req.payload.findByID({
        collection: 'products',
        id: productId,
      }) as Product;

      if (!product?.price) {
        return item;
      }

      // Populate price from product
      return {
        ...item,
        price: {
          amount: product.price.amount || 0,
          currency: product.price.currency || 'NOK',
          vatRate: product.price.vatRate ?? 25,
        },
      };
    }),
  );

  return {
    ...data,
    items: itemsWithPrices,
  };
};
