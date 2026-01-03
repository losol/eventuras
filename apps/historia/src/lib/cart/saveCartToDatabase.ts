'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import {
  createAndPersistSession,
  getCurrentSession,
} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import type { CartItem } from './types';
import { getCurrentWebsiteId } from '../website';

const logger = Logger.create({
  namespace: 'historia:carts:saveToDatabase',
  context: { module: 'saveCartToDatabase' },
});

/**
 * Save cart from session to database for secure payment validation.
 *
 * This action is called when the user initiates payment, moving the cart
 * from encrypted session storage to the database. This ensures:
 * 1. Cart data persists during payment flow (even if session expires)
 * 2. Payment callback can securely validate cart contents
 * 3. Cart is tied to payment reference for ownership validation
 *
 * @returns Cart ID and secret for payment flow, or error
 */
export async function saveCartToDatabase(): Promise<
  ServerActionResult<{ cartId: string; cartSecret: string }>
> {
  try {
    logger.info('Saving cart to database');

    // Get current session
    const session = await getCurrentSession();

    if (!session?.data?.cart) {
      logger.warn('No cart in session');
      return actionError('No cart found in session');
    }

    // Check if cart has items
    if (!session.data.cart.items || session.data.cart.items.length === 0) {
      logger.warn('Cart is empty');
      return actionError('Cannot save empty cart');
    }

    // Get payload instance
    const payload = await getPayload({ config: configPromise });

    // Get current website/tenant ID
    const websiteId = await getCurrentWebsiteId();
    if (!websiteId) {
      logger.error('Cannot save cart without website/tenant');
      return actionError('Website configuration not found');
    }

    // Prepare cart data for database
    // Convert session cart items to database format
    const cartData = {
      items: session.data.cart.items.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customer: null, // Guest checkout (no authenticated user)
      tenant: websiteId, // Required by multiTenantPlugin
    };

    // Get or create session ID for rate limiting
    // This provides a stable identifier across requests for the same session
    let sessionId = session.data.sessionId as string | undefined;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      // Persist the session ID for future requests
      await createAndPersistSession({
        ...session,
        data: {
          ...session.data,
          sessionId,
        },
      });
    }

    // Create cart in database
    const result = await payload.create({
      collection: 'carts' as any, // Type will be generated after running dev server
      data: cartData,
      req: {
        headers: new Headers({
          'x-session-id': sessionId,
        }),
      } as any,
    });

    if (!result.id) {
      logger.error({ result }, 'Cart creation failed - no ID returned');
      return actionError('Failed to create cart in database');
    }

    // Extract secret from response (only available on creation)
    const cartSecret = (result as any).secret as string;

    if (!cartSecret) {
      logger.error({ cartId: result.id }, 'Cart created but no secret returned');
      return actionError('Cart created but authentication failed');
    }

    logger.info(
      {
        cartId: result.id,
        itemCount: cartData.items.length,
      },
      'Cart saved to database successfully',
    );

    // Update session with cart ID and secret
    await createAndPersistSession({
      ...session,
      data: {
        ...session.data,
        cartId: String(result.id),
        cartSecret: cartSecret,
      },
    });

    logger.debug('Session updated with cart ID and secret');

    return actionSuccess(
      {
        cartId: String(result.id),
        cartSecret: cartSecret,
      },
      'Cart saved successfully',
    );
  } catch (error) {
    logger.error({ error }, 'Error saving cart to database');

    // Provide user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return actionError(`Failed to save cart: ${errorMessage}`);
  }
}
