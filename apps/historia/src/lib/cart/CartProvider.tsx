'use client';

import React, { createContext, useContext } from 'react';

import type { Cart } from './types';
import { useSessionCart } from './use-session-cart';

interface CartContextValue {
  cart: Cart | null;
  items: Cart['items'];
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<any>;
  updateCartItem: (productId: string, quantity: number) => Promise<any>;
  removeFromCart: (productId: string) => Promise<any>;
  clearCart: () => Promise<any>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useSessionCart();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
