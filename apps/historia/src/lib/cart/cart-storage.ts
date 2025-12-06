/**
 * Simple cart storage using localStorage
 * Stores only productId and quantity
 */

export interface CartItem {
  productId: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'historia-cart';

/**
 * Get all items from cart
 */
export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as CartItem[];
  } catch (error) {
    console.error('Failed to read cart from localStorage:', error);
    return [];
  }
}

/**
 * Save cart items to localStorage
 */
function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

/**
 * Add item to cart or update quantity if it exists
 */
export function addToCart(productId: string, quantity: number = 1): CartItem[] {
  const items = getCartItems();
  const existingIndex = items.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    // Update existing item
    items[existingIndex].quantity += quantity;
  } else {
    // Add new item
    items.push({ productId, quantity });
  }

  saveCartItems(items);
  return items;
}

/**
 * Update quantity for a specific product
 */
export function updateCartItem(productId: string, quantity: number): CartItem[] {
  const items = getCartItems();
  const existingIndex = items.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      items.splice(existingIndex, 1);
    } else {
      items[existingIndex].quantity = quantity;
    }
  }

  saveCartItems(items);
  return items;
}

/**
 * Remove item from cart
 */
export function removeFromCart(productId: string): CartItem[] {
  const items = getCartItems().filter((item) => item.productId !== productId);
  saveCartItems(items);
  return items;
}

/**
 * Clear entire cart
 */
export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

/**
 * Get total number of items in cart
 */
export function getCartItemCount(): number {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
