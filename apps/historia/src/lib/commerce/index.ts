/**
 * Commerce business logic and utilities.
 *
 * This module exports all commerce-related business rules, permissions,
 * and utilities used throughout the Historia CMS.
 */

// Order status business rules
export {
  EDITABLE_ORDER_STATUSES,
  getOrderLockReason,
  isOrderEditableByCommerce,
  isOrderLocked,
  LOCKED_ORDER_STATUSES,
  type OrderStatus,
} from './orderStatusRules';

// Order permissions (Payload access control)
export { ordersUpdateAccess } from './orderPermissions';
