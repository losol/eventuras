import type { Access } from 'payload';

/**
 * Combines multiple access control functions with OR logic.
 *
 * Returns true if any of the access functions returns true.
 * If one returns a constraint object, returns that constraint.
 * If multiple return constraints, combines them with OR logic.
 *
 * Useful for granting access to multiple roles:
 * - `accessOR(admins, editors)`
 * - `accessOR(admins, commerceManagers, hasCartSecretAccess)`
 *
 * @param accessFunctions - Access control functions to combine with OR
 * @returns Combined access control function
 *
 * @example
 * // Allow both editors and admins to update
 * export const Organizations: CollectionConfig = {
 *   access: {
 *     update: accessOR(admins, editors),
 *   },
 * };
 */
export const accessOR = (...accessFunctions: Access[]): Access => {
  return async (args) => {
    const results = await Promise.all(accessFunctions.map((fn) => fn(args)));

    // If any function returns true, grant access
    if (results.some((result) => result === true)) {
      return true;
    }

    // Collect constraint objects (filter out false/undefined)
    const constraints = results.filter(
      (result) => typeof result === 'object' && result !== null,
    );

    // If no constraints, deny access
    if (constraints.length === 0) {
      return false;
    }

    // If single constraint, return it
    if (constraints.length === 1) {
      return constraints[0];
    }

    // Combine multiple constraints with OR
    return {
      or: constraints,
    };
  };
};
