import { admins } from '@/access/admins';
import { siteCommerceManagers } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';

import { hasCartSecretAccess } from './hasCartSecretAccess';

/**
 * Access control for carts collection.
 * Allows:
 * - Admins (full access to all carts in their tenants)
 * - Commerce role (read access to all carts in their tenants)
 * - Anyone with valid cart secret (read/update via query parameter for guest checkout)
 */
export const cartsAccess = {
  create: admins,
  read: accessOR(admins, siteCommerceManagers, hasCartSecretAccess),
  update: accessOR(admins, hasCartSecretAccess),
  delete: admins,
};
