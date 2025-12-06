/**
 * Cart module - Session-based cart using encrypted JWT
 *
 * This replaces the old localStorage-based cart with secure server-side storage.
 */

export { CartProvider, useCart } from './CartProvider';
export type { Cart, CartItem, SessionData } from './types';
export { useSessionCart } from './use-session-cart';
