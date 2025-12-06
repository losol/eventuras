'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Cart item interface - stores only productId and quantity
 * Product details are fetched separately when needed
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * Cart context interface
 */
interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Cart context
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Local storage key for cart items
 */
const CART_STORAGE_KEY = 'historia-cart';

/**
 * Load cart items from localStorage
 */
function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return [];
}

/**
 * Cart provider component
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  // Add item to cart
  const addToCart = useCallback((productId: string, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === productId);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      // Add new item
      return [...prevItems, { productId, quantity }];
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  // Update item quantity
  const updateCartItem = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate total item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    itemCount,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to use cart context
 */
export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
