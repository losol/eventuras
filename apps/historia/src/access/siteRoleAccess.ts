import type { Access } from 'payload';

import { isSystemAdmin } from './isSystemAdmin';
import { getUserTenantIDs } from '../utilities/getUserTenantIDs';

/**
 * Site editors only.
 *
 * Grants access to users with the 'editor' role on specific tenants.
 * System admins always have access.
 *
 * @example
 * // Use with accessOR for content collections
 * create: accessOR(admins, siteEditors)
 */
export const siteEditors: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;
  if (isSystemAdmin(req.user)) return true;

  const editorTenantIDs = getUserTenantIDs(req.user, 'editor');

  return editorTenantIDs.length > 0
    ? { tenant: { in: editorTenantIDs } }
    : false;
};

/**
 * Commerce managers only.
 *
 * Grants access to users with the 'commerce' role on specific tenants.
 * System admins always have access.
 *
 * @example
 * // Use with accessOR for commerce collections
 * create: accessOR(admins, siteCommerceManagers)
 */
export const siteCommerceManagers: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;
  if (isSystemAdmin(req.user)) return true;

  const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');

  return commerceTenantIDs.length > 0
    ? { tenant: { in: commerceTenantIDs } }
    : false;
};

/**
 * Site members only.
 *
 * Grants access to users with the 'member' role on specific tenants.
 * System admins always have access.
 *
 * @example
 * // Use with accessOR for read-only access
 * read: accessOR(admins, siteEditors, siteCommerceManagers, siteMembers)
 */
export const siteMembers: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;
  if (isSystemAdmin(req.user)) return true;

  const memberTenantIDs = getUserTenantIDs(req.user, 'member');

  return memberTenantIDs.length > 0
    ? { tenant: { in: memberTenantIDs } }
    : false;
};
