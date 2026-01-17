import { extractID } from './extractID';
import type { User, Website } from '../payload-types';

/**
 * Returns array of all tenant IDs assigned to a user
 *
 * @param user - User object with tenants field
 * @param role - Optional role to filter by (admin, editor, commerce, or member)
 */
export const getUserTenantIDs = (
  user: null | User,
  role?: NonNullable<User['tenants']>[number]['siteRoles'][number],
): Website['id'][] => {
  if (!user) {
    return [];
  }

  return (
    user?.tenants?.reduce<Website['id'][]>((acc, { siteRoles, tenant }) => {
      if (role && !siteRoles.includes(role)) {
        return acc;
      }

      if (tenant) {
        acc.push(extractID(tenant));
      }

      return acc;
    }, []) || []
  );
};
