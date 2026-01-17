import type { Access, FieldAccess } from 'payload';

import { isSystemAdmin } from './isSystemAdmin';
import { getUserTenantIDs } from '../utilities/getUserTenantIDs';

/**
 * Grants access to system-admins (globally) and site admins (tenant-scoped).
 *
 * - System admins return `true` (full access)
 * - Site admins return a tenant constraint (access only to their assigned tenants)
 *
 * @example
 * // Topics collection - admins can create/update/delete
 * export const Topics: CollectionConfig = {
 *   access: {
 *     create: admins,
 *     update: admins,
 *     delete: admins,
 *   },
 * };
 */
export const admins: Access = ({ req: { user } }) => {
  if (!user || !('email' in user)) return false;

  // System admins have full access
  if (isSystemAdmin(user)) return true;

  // Site admins have access to their assigned tenants
  const adminTenantIDs = getUserTenantIDs(user, 'admin');

  return adminTenantIDs.length > 0
    ? { tenant: { in: adminTenantIDs } }
    : false;
};

/**
 * Field-level access control for admins.
 *
 * - System admins return `true` (can access field)
 * - Site admins return `true` (can access field)
 * - Others return `false` (cannot access field)
 *
 * Note: Field-level access cannot apply tenant constraints,
 * so site admins get full field access. Use collection-level
 * access to enforce tenant scoping.
 *
 * @example
 * {
 *   name: 'sensitiveField',
 *   type: 'text',
 *   access: {
 *     read: adminsFieldLevel,
 *     update: adminsFieldLevel,
 *   },
 * }
 */
export const adminsFieldLevel: FieldAccess = ({ req: { user } }) => {
  if (!user || !('email' in user)) return false;

  // System admins have full access
  if (isSystemAdmin(user)) return true;

  // Site admins have field access (tenant scoping applied at collection level)
  const adminTenantIDs = getUserTenantIDs(user, 'admin');

  return adminTenantIDs.length > 0;
};
