import type { Access, Where } from 'payload';

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs';

import { isSystemAdmin } from './isSystemAdmin';

/**
 * Read access for Orders collection.
 * - System admins can read all orders
 * - Commerce and admin roles can read orders in their tenants OR their own orders
 * - Users can only read their own orders
 */
export const ordersReadAccess: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;

  // System admins see all orders
  if (isSystemAdmin(req.user)) return true;

  // Commerce and admin roles see all orders in their tenants
  const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');
  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');

  if (commerceTenantIDs.length || adminTenantIDs.length) {
    const tenantIDs = [...commerceTenantIDs, ...adminTenantIDs];
    const conditions = [
      { user: { equals: req.user.id } },
      { tenant: { in: tenantIDs } },
    ];
    return { or: conditions } as unknown as Where;
  }

  // Users can only read their own orders
  return { user: { equals: req.user.id } };
};

/**
 * Read access for Shipments collection.
 * - System admins can read all shipments
 * - Commerce and admin roles can read shipments in their tenants OR for their own orders
 * - Users can only read shipments for their own orders
 */
export const shipmentsReadAccess: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;

  // System admins can read all shipments
  if (isSystemAdmin(req.user)) return true;

  // Commerce and admin roles can read shipments in their tenants
  const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');
  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');

  if (commerceTenantIDs.length || adminTenantIDs.length) {
    const tenantIDs = [...commerceTenantIDs, ...adminTenantIDs];
    const conditions = [
      { 'order.customer': { equals: req.user.id } },
      { 'order.tenant': { in: tenantIDs } },
    ];
    return { or: conditions } as unknown as Where;
  }

  // Users can only read shipments for their orders
  return { 'order.customer': { equals: req.user.id } };
};

/**
 * Read access for Transactions collection.
 * - System admins can read all transactions
 * - Commerce and admin roles can read transactions in their tenants OR their own transactions
 * - Users can only read their own transactions
 */
export const transactionsReadAccess: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;

  // System admins can read all transactions
  if (isSystemAdmin(req.user)) return true;

  // Commerce and admin roles can read transactions in their tenants
  const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');
  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');

  if (commerceTenantIDs.length || adminTenantIDs.length) {
    const tenantIDs = [...commerceTenantIDs, ...adminTenantIDs];
    const conditions = [
      { customer: { equals: req.user.id } },
      { 'order.tenant': { in: tenantIDs } },
    ];
    return { or: conditions } as unknown as Where;
  }

  // Users can only read their own transactions
  return { customer: { equals: req.user.id } };
};
