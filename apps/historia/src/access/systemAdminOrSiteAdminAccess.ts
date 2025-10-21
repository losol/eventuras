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

  if (isSystemAdmin(req.user)) {
    return true;
  }

  return {
    tenant: {
      in: getUserTenantIDs(req.user, 'site-admin'),
    },
  };
};
