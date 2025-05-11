import type { Website, User } from '../payload-types';
import { extractID } from './extractID';

/**
 * Returns array of all tenant IDs assigned to a user
 *
 * @param user - User object with tenants field
 * @param role - Optional role to filter by
 */
export const getUserTenantIDs = (
  user: null | User,
  role?: NonNullable<User['tenants']>[number]['roles'][number],
): Website['id'][] => {
  if (!user) {
    return [];
  }

  return (
    user?.tenants?.reduce<Website['id'][]>((acc, { roles, tenant }) => {
      if (role && !roles.includes(role)) {
        return acc;
      }

      if (tenant) {
        acc.push(extractID(tenant));
      }

      return acc;
    }, []) || []
  );
};
