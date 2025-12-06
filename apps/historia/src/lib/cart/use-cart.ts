'use client';

import { useState } from 'react';

import {
  addToCart as addToCartStorage,
  type CartItem,
  clearCart as clearCartStorage,
  getCartItems,
  removeFromCart as removeFromCartStorage,
  updateCartItem as updateCartItemStorage,
} from './cart-storage';

/**
 * React hook for managing cart state
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());

  const addToCart = (productId: string, quantity: number = 1) => {
    const updatedItems = addToCartStorage(productId, quantity);
    setItems(updatedItems);
  };

  const updateCartItem = (productId: string, quantity: number) => {
    const updatedItems = updateCartItemStorage(productId, quantity);
    setItems(updatedItems);
  };

  const removeFromCart = (productId: string) => {
    const updatedItems = removeFromCartStorage(productId);
    setItems(updatedItems);
  };

  const clearCart = () => {
    clearCartStorage();
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    itemCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
