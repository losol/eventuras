/**
 * Access control functions for Orders collection.
 *
 * These functions implement the business rules defined in orderStatusRules.ts
 * within Payload CMS access control system.
 */

import type { Access } from 'payload';

import { isSystemAdmin } from '@/access/isSystemAdmin';
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs';

import { isOrderEditableByCommerce } from './orderStatusRules';

/**
 * Update access for Orders collection.
 *
 * Business rules:
 * - System admins can always update any order
 * - Commerce managers and admins can update orders with status 'pending' or 'processing'
 * - Orders with other statuses ('on-hold', 'completed', 'canceled') require system admin
 *
 * @see {@link orderStatusRules.ts} for status validation logic
 * @see `apps/historia/docs/administrator/orders.md` for detailed permissions and examples
 *
 * @example
 * ```ts
 * // In Orders collection
 * {
 *   access: {
 *     update: ordersUpdateAccess,
 *   }
 * }
 * ```
 */
export const ordersUpdateAccess: Access = (args) => {
  const { req, data } = args;
  const doc = (args as { doc?: unknown }).doc;
  if (!req.user || !('email' in req.user)) return false;

  // System admins can always update
  if (isSystemAdmin(req.user)) return true;

  // Check the CURRENT order status from the database (not the incoming data)
  // This prevents bypassing the restriction by changing status in the same request
  if (!doc) {
    // If we cannot load the current document, fail closed
    return false;
  }

  const orderStatus = (doc as any).status;
  if (!isOrderEditableByCommerce(orderStatus)) {
    return false;
  }

  // Check if user has commerce or admin role in any tenant
  const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');
  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');

  if (commerceTenantIDs.length || adminTenantIDs.length) {
    // Return tenant constraint - can only update orders in their tenants
    return { tenant: { in: [...commerceTenantIDs, ...adminTenantIDs] } };
  }

  return false;
};
