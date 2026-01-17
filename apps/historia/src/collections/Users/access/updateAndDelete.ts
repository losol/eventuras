import type { Access } from 'payload';

import { isSystemAdmin } from '@/access/isSystemAdmin';

import { isAccessingSelf } from './isAccessingSelf';
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs';

export const updateAndDeleteAccess: Access = ({ req, id }) => {
  const { user } = req;

  if (!user) {
    return false;
  }

  // Check if user is from 'users' collection before passing to functions
  if (user && 'email' in user) {
    if (isSystemAdmin(user) || isAccessingSelf({ user, id })) {
      return true;
    }

    /**
     * Constrains update and delete access to users that belong
     * to the same tenant as the tenant-admin making the request
     *
     * You may want to take this a step further with a beforeChange
     * hook to ensure that the a tenant-admin can only remove users
     * from their own tenant in the tenants array.
     */
    return {
      'tenants.tenant': {
        in: getUserTenantIDs(user, 'admin'),
      },
    };
  }

  return false;
};
