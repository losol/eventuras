/**
 * Cart types for Historia commerce
 */

export interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * Customer information from Vipps Checkout
 * Captured via customer_information_changed SDK event
 */
export interface CustomerInfo {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
}

export interface Cart {
  items: CartItem[];
  createdAt?: string;
  expiresAt?: string;
  paymentReference?: string;
  customerInfo?: CustomerInfo;
}

/**
 * Session data type that includes cart and payment history
 */
export interface SessionData {
  cart?: Cart;
  /** List of payment references owned by this session for access control */
  paymentReferences?: string[];
  /**
   * Database cart ID - set when cart is saved to database at payment initiation
   */
  cartId?: string;
  /**
   * Cart secret for secure access to database cart during payment callback
   */
  cartSecret?: string;
}
