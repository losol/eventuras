import { Access } from 'payload';

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs';

import { isSystemAdmin } from './isSystemAdmin';

/**
 * Tenant admins and super admins can will be allowed access
 */
export const superAdminOrSiteAdminAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  // Check if user is from 'users' collection before passing to isSystemAdmin
  if (req.user && 'email' in req.user && isSystemAdmin(req.user)) {
    return true;
  }

  // Only User types can have tenant access
  if (req.user && 'email' in req.user) {
    return {
      tenant: {
        in: getUserTenantIDs(req.user, 'site-admin'),
      },
    };
  }

  return false;
};
