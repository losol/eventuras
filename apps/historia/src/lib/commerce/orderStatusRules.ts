/**
 * Business rules for order status transitions and permissions.
 *
 * This module defines the core business logic for order management,
 * independent of Payload CMS access control.
 */

/**
 * Order statuses in the system
 */
export type OrderStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'canceled';

/**
 * Statuses that allow editing by commerce managers and admins
 */
export const EDITABLE_ORDER_STATUSES: readonly OrderStatus[] = ['pending', 'processing'] as const;

/**
 * Statuses that are considered "locked" and require system admin to edit
 */
export const LOCKED_ORDER_STATUSES: readonly OrderStatus[] = ['on-hold', 'completed', 'canceled'] as const;

/**
 * Check if an order status allows editing by commerce managers/admins.
 *
 * Business rule: Only orders in 'pending' or 'processing' status can be
 * edited by regular commerce staff. Other statuses require system admin.
 *
 * @param status - The current order status
 * @returns true if the order can be edited by commerce/admin roles
 *
 * @example
 * ```ts
 * isOrderEditableByCommerce('pending')    // true
 * isOrderEditableByCommerce('processing') // true
 * isOrderEditableByCommerce('completed')  // false
 * isOrderEditableByCommerce('canceled')   // false
 * ```
 */
export function isOrderEditableByCommerce(status: string | undefined): boolean {
  if (!status) return false;
  return EDITABLE_ORDER_STATUSES.includes(status as OrderStatus);
}

/**
 * Check if an order status is locked and requires system admin to edit.
 *
 * @param status - The current order status
 * @returns true if the order is locked
 */
export function isOrderLocked(status: string | undefined): boolean {
  if (!status) return false;
  return LOCKED_ORDER_STATUSES.includes(status as OrderStatus);
}

/**
 * Get a human-readable reason why an order cannot be edited.
 *
 * @param status - The current order status
 * @returns Explanation string or null if order is editable
 */
export function getOrderLockReason(status: string | undefined): string | null {
  if (!status) return 'Order status is missing';

  if (isOrderLocked(status)) {
    return `Orders with status '${status}' can only be edited by system administrators`;
  }

  return null;
}
