'use server';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import type { Session } from '@eventuras/fides-auth-next';
import {
  createSession,
  getCurrentSession,
  setSessionCookie,
} from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';

import type { Cart, CartItem, CustomerInfo, SessionData } from '@/lib/cart/types';

const logger = Logger.create({
  namespace: 'historia:cart-actions',
  context: { module: 'CartActions' },
});

const CART_EXPIRY_HOURS = 24;

/**
 * Get the current cart from the encrypted session
 */
export async function getCart(): Promise<Cart | null> {
  try {
    const session = await getCurrentSession();

    if (!session?.data?.cart) {
      logger.debug('No cart in session');
      return null;
    }

    // Check if cart has expired
    const expiresAt = new Date(session.data.cart.expiresAt);
    if (expiresAt < new Date()) {
      logger.info('Cart expired, clearing');
      await clearCart();
      return null;
    }

    logger.debug(
      { itemCount: session.data.cart.items.length },
      'Retrieved cart from session'
    );
    return session.data.cart;
  } catch (error) {
    logger.error({ error }, 'Error getting cart');
    return null;
  }
}

/**
 * Add an item to the cart
 */
export async function addToCart(
  productId: string,
  quantity: number
): Promise<ServerActionResult<Cart>> {
  try {
    logger.info({ productId, quantity }, 'Adding item to cart');

    if (quantity <= 0) {
      return actionError('Quantity must be greater than 0');
    }

    const session = await getCurrentSession();
    const existingCart = session?.data?.cart;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CART_EXPIRY_HOURS * 60 * 60 * 1000);

    // Find if item already exists in cart
    const existingItems = existingCart?.items || [];
    const existingItemIndex = existingItems.findIndex(
      (item: CartItem) => item.productId === productId
    );

    let updatedItems: CartItem[];
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      updatedItems = [...existingItems];
      updatedItems[existingItemIndex] = {
        productId,
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
      logger.info(
        { productId, newQuantity: updatedItems[existingItemIndex].quantity },
        'Updated existing cart item'
      );
    } else {
      // Add new item
      updatedItems = [...existingItems, { productId, quantity }];
      logger.info({ productId, quantity }, 'Added new cart item');
    }

    const updatedCart: Cart = {
      items: updatedItems,
      createdAt: existingCart?.createdAt || now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      // Clear payment reference when cart contents change
      paymentReference: undefined,
    };

    const updatedSession: Session<SessionData> = {
      ...session,
      data: {
        ...session?.data,
        cart: updatedCart,
      },
    };

    try {
      const jwt = await createSession(updatedSession);
      await setSessionCookie(jwt);
    } catch (sessionError) {
      logger.error({ error: sessionError, updatedCart }, 'Failed to create session');
      throw sessionError;
    }

    logger.info(
      { itemCount: updatedCart.items.length },
      'Cart updated successfully'
    );
    return actionSuccess(updatedCart);
  } catch (error) {
    logger.error({ error, productId, quantity }, 'Error adding to cart');
    return actionError('Failed to add item to cart');
  }
}

/**
 * Update the quantity of an item in the cart
 */
export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<ServerActionResult<Cart>> {
  try {
    logger.info({ productId, quantity }, 'Updating cart item');

    if (quantity < 0) {
      return actionError('Quantity cannot be negative');
    }

    const session = await getCurrentSession();
    const existingCart = session?.data?.cart;

    if (!existingCart?.items) {
      return actionError('Cart is empty');
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      return await removeFromCart(productId);
    }

    const updatedItems = existingCart.items.map((item: CartItem) =>
      item.productId === productId ? { productId, quantity } : item
    );

    const updatedCart: Cart = {
      ...existingCart,
      items: updatedItems,
      // Clear payment reference when cart contents change
      paymentReference: undefined,
    };

    const updatedSession: Session<SessionData> = {
      ...session,
      data: {
        ...session?.data,
        cart: updatedCart,
      },
    };

    const jwt = await createSession(updatedSession);
    await setSessionCookie(jwt);

    logger.info({ productId, quantity }, 'Cart item updated successfully');
    return actionSuccess(updatedCart);
  } catch (error) {
    logger.error({ error, productId, quantity }, 'Error updating cart item');
    return actionError('Failed to update cart item');
  }
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(
  productId: string
): Promise<ServerActionResult<Cart>> {
  try {
    logger.info({ productId }, 'Removing item from cart');

    const session = await getCurrentSession();
    const existingCart = session?.data?.cart;

    if (!existingCart?.items) {
      return actionError('Cart is empty');
    }

    const updatedItems = existingCart.items.filter(
      (item: CartItem) => item.productId !== productId
    );

    const updatedCart: Cart = {
      ...existingCart,
      items: updatedItems,
      // Clear payment reference when cart contents change
      paymentReference: undefined,
    };

    const updatedSession: Session<SessionData> = {
      ...session,
      data: {
        ...session?.data,
        cart: updatedCart,
      },
    };

    const jwt = await createSession(updatedSession);
    await setSessionCookie(jwt);

    logger.info(
      { productId, remainingItems: updatedItems.length },
      'Item removed from cart'
    );
    return actionSuccess(updatedCart);
  } catch (error) {
    logger.error({ error, productId }, 'Error removing from cart');
    return actionError('Failed to remove item from cart');
  }
}

/**
 * Clear all items from the cart
 */
export async function clearCart(): Promise<ServerActionResult<void>> {
  try {
    logger.info('Clearing cart');

    const session = await getCurrentSession();

    const updatedSession: Session<SessionData> = {
      ...session,
      data: {
        ...session?.data,
        cart: undefined,
        paymentReferences: undefined, // Clear payment references when cart is cleared
      },
    };

    const jwt = await createSession(updatedSession);
    await setSessionCookie(jwt);

    logger.info('Cart and payment references cleared successfully');
    return actionSuccess(undefined);
  } catch (error) {
    logger.error({ error }, 'Error clearing cart');
    return actionError('Failed to clear cart');
  }
}

/**
 * Set the payment reference in the cart session
 * Called when initiating Vipps payment to link cart with payment
 * SECURITY: Adds reference to encrypted session for access control
 */
export async function setCartPaymentReference(
  reference: string
): Promise<ServerActionResult<void>> {
  try {
    logger.info({ reference }, 'Setting payment reference in cart');

    const session = await getCurrentSession();
    const existingCart = session?.data?.cart;

    if (!existingCart?.items || existingCart.items.length === 0) {
      return actionError('Cart is empty');
    }

    // Get existing payment references from session
    const existingReferences = session?.data?.paymentReferences || [];

    // Add new reference if not already present
    const paymentReferences = existingReferences.includes(reference)
      ? existingReferences
      : [...existingReferences, reference];

    const updatedCart: Cart = {
      ...existingCart,
      paymentReference: reference,
    };

    const updatedSession: Session<SessionData> = {
      ...session,
      data: {
        ...session?.data,
        cart: updatedCart,
        paymentReferences,
      },
    };

    const jwt = await createSession(updatedSession);
    await setSessionCookie(jwt);

    logger.info(
      { reference, totalReferences: paymentReferences.length },
      'Payment reference set and added to session'
    );
    return actionSuccess(undefined);
  } catch (error) {
    logger.error({ error, reference }, 'Error setting payment reference');
    return actionError('Failed to set payment reference');
  }
}

/**
 * Get cart item count for display purposes
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const cart = await getCart();
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch (error) {
    logger.error({ error }, 'Error getting cart item count');
    return 0;
  }
}

/**
 * Update customer information in cart
 * Called when customer_information_changed event fires in Vipps Checkout
 */
export async function updateCartCustomerInfo(
  customerInfo: CustomerInfo
): Promise<ServerActionResult<Cart>> {
  try {
    logger.info({ customerInfo }, 'Updating customer information in cart');

    const session = await getCurrentSession();
    const existingCart = session?.data?.cart;

    if (!existingCart?.items || existingCart.items.length === 0) {
      return actionError('Cart is empty');
    }

    const updatedCart: Cart = {
      ...existingCart,
      customerInfo,
    };

    const updatedSession: Session<SessionData> = {
      ...session,
      data: {
        ...session?.data,
        cart: updatedCart,
      },
    };

    const jwt = await createSession(updatedSession);
    await setSessionCookie(jwt);

    logger.info(
      { hasEmail: !!customerInfo.email, hasName: !!(customerInfo.firstName || customerInfo.lastName) },
      'Customer information updated successfully'
    );
    return actionSuccess(updatedCart);
  } catch (error) {
    logger.error({ error }, 'Error updating customer information');
    return actionError('Failed to update customer information');
  }
}
