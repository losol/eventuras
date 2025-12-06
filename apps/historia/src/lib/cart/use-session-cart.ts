'use client';

import { useEffect, useState } from 'react';

import { Logger } from '@eventuras/logger';

import {
  addToCart as addToCartAction,
  clearCart as clearCartAction,
  getCart as getCartAction,
  removeFromCart as removeFromCartAction,
  updateCartItem as updateCartItemAction,
} from '@/app/actions/cart';

import type { Cart } from './types';

const logger = Logger.create({
  namespace: 'historia:cart',
  context: { module: 'useSessionCart' },
});

/**
 * React hook for managing cart state using encrypted session storage
 *
 */
export function useSessionCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cart from session on mount
  useEffect(() => {
    async function loadCart() {
      try {
        const sessionCart = await getCartAction();
        setCart(sessionCart);
      } catch (error) {
        logger.error({ error }, 'Failed to load cart from session');
        setCart(null);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1) => {
    const result = await addToCartAction(productId, quantity);
    if (result.success) {
      setCart(result.data);
      logger.debug(
        {
          itemCount: result.data.items.length,
          totalQuantity: result.data.items.reduce((sum: number, item) => sum + item.quantity, 0)
        },
        'Cart updated after add'
      );
    } else {
      logger.error(
        {
          errorMessage: result.error?.message,
          productId,
          quantity
        },
        'Failed to add to cart'
      );
    }
    return result;
  };  const updateCartItem = async (productId: string, quantity: number) => {
    const result = await updateCartItemAction(productId, quantity);
    if (result.success) {
      setCart(result.data);
    } else {
      logger.error(
        {
          errorMessage: result.error?.message,
          productId,
          quantity
        },
        'Failed to update cart item'
      );
    }
    return result;
  };

  const removeFromCart = async (productId: string) => {
    const result = await removeFromCartAction(productId);
    if (result.success) {
      setCart(result.data);
    } else {
      logger.error(
        {
          errorMessage: result.error?.message,
          productId
        },
        'Failed to remove from cart'
      );
    }
    return result;
  };

  const clearCart = async () => {
    const result = await clearCartAction();
    if (result.success) {
      setCart(null);
    } else {
      logger.error(
        { errorMessage: result.error?.message },
        'Failed to clear cart'
      );
    }
    return result;
  };

  const refreshCart = async () => {
    try {
      const sessionCart = await getCartAction();
      setCart(sessionCart);
      logger.debug({ itemCount: sessionCart?.items.length || 0 }, 'Cart refreshed');
    } catch (error) {
      logger.error({ error }, 'Failed to refresh cart');
    }
  };

  const items = cart?.items || [];
  const itemCount = items.reduce((total: number, item) => total + item.quantity, 0);

  return {
    cart,
    items,
    itemCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };
}
