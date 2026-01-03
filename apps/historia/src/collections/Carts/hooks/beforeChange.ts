import crypto from 'crypto';

import type { CollectionBeforeChangeHook } from 'payload';

import { Logger } from '@eventuras/logger';

import { checkRateLimit } from '../rateLimit';

const logger = Logger.create({
  namespace: 'historia:carts:beforeChange',
  context: { module: 'CartsBeforeChange' },
});

/**
 * Before change hook for carts collection.
 *
 * Handles:
 * 1. Secret generation for new carts (guest checkout)
 * 2. Rate limiting for cart creation
 * 3. Product validation and inventory check
 * 4. Quantity sanitization
 *
 * Inspired by Payload's e-commerce plugin:
 * @see https://github.com/payloadcms/payload/blob/main/packages/plugin-ecommerce/src/collections/carts/beforeChange.ts
 */
export const beforeChangeCart: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  // 1. Generate secret for guest cart access on creation
  if (operation === 'create' && !data.customer && !data.secret) {
    // Generate a cryptographically secure random string (40 characters)
    const secret = crypto.randomBytes(20).toString('hex');
    data.secret = secret;

    // Store in context so afterRead hook can include it in the creation response
    if (!req.context) {
      req.context = {};
    }
    req.context.newCartSecret = secret;

    logger.info('Generated secret for new guest cart');
  }

  // 2. Rate limiting for cart creation
  if (operation === 'create') {
    // Get session ID from request (use a default if not available)
    const sessionId = req.headers.get('x-session-id') || req.user?.id || 'anonymous';

    try {
      checkRateLimit(sessionId);
    } catch (error) {
      logger.error({ error, sessionId }, 'Rate limit check failed');
      throw error;
    }
  }

  // 3. Validate and sanitize items
  if (data.items && Array.isArray(data.items)) {
    // Enforce reasonable cart size limit
    if (data.items.length > 100) {
      throw new Error('Cart cannot contain more than 100 items');
    }

    if (data.items.length === 0) {
      throw new Error('Cart must contain at least one item');
    }

    for (const item of data.items) {
      // Validate and sanitize product ID - must be valid UUID
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error('Cart item must have a valid product ID');
      }

      // Sanitize productId - trim whitespace and validate UUID format
      const sanitizedProductId = item.productId.trim();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(sanitizedProductId)) {
        throw new Error(`Invalid product ID format: ${sanitizedProductId.substring(0, 50)}`);
      }

      item.productId = sanitizedProductId;

      // Sanitize quantity - ensure it's a positive integer with reasonable max
      const quantity = Math.max(1, Math.min(9999, Math.floor(Number(item.quantity) || 1)));
      item.quantity = quantity;

      // Fetch product to validate existence and check inventory
      const productId = item.productId;

      try {
        const product = await req.payload.findByID({
          collection: 'products',
          id: productId,
          depth: 0,
        });

        if (!product) {
          logger.error({ productId }, 'Product not found');
          throw new Error(`Product with ID ${productId} not found`);
        }

        // Check inventory if specified
        if (
          typeof product.inventory === 'number' &&
          product.inventory >= 0 &&
          quantity > product.inventory
        ) {
          logger.warn(
            {
              productId,
              requestedQuantity: quantity,
              availableInventory: product.inventory,
            },
            'Insufficient inventory',
          );
          throw new Error(
            `Insufficient inventory for product "${product.title}". Available: ${product.inventory}, requested: ${quantity}`,
          );
        }

        logger.debug(
          {
            productId,
            quantity,
            inventory: product.inventory,
          },
          'Cart item validated',
        );
      } catch (error) {
        logger.error({ error, productId }, 'Error validating product');
        throw error;
      }
    }

    logger.info({ itemCount: data.items.length }, 'Cart items validated');
  }

  // 4. Validate customer field if present
  if (data.customer) {
    // If customer is provided, validate it's a valid UUID
    const customerId = typeof data.customer === 'string' ? data.customer : data.customer.id;

    if (typeof customerId !== 'string') {
      throw new Error('Invalid customer ID');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(customerId)) {
      throw new Error('Invalid customer ID format');
    }
  }

  return data;
};
