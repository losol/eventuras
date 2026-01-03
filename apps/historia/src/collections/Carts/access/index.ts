import type { Access } from 'payload';

import { admins } from '@/access/admins';

import { hasCartSecretAccess } from './hasCartSecretAccess';

/**
 * Combine multiple access control functions with OR logic.
 * If any function returns true or a query, access is granted.
 */
const accessOR = (...accessFunctions: Access[]): Access => {
  return async (args) => {
    const results = await Promise.all(accessFunctions.map((fn) => fn(args)));

    // If any result is true, allow access
    if (results.some((result) => result === true)) {
      return true;
    }

    // If any result is a where query, combine with OR
    const queries = results.filter((result) => typeof result === 'object' && result !== null);
    if (queries.length > 0) {
      return {
        or: queries,
      };
    }

    return false;
  };
};

/**
 * Access control for carts collection.
 * Allows:
 * - Admins (full access)
 * - Anyone with valid cart secret (read/update via query parameter)
 */
export const cartsAccess = {
  create: admins,
  read: accessOR(admins, hasCartSecretAccess),
  update: accessOR(admins, hasCartSecretAccess),
  delete: admins,
};
