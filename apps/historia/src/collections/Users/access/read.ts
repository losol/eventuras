import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities';
import type { Access, Where } from 'payload';

import type { User } from '@/payload-types';

import { isAccessingSelf } from './isAccessingSelf';
import { isSystemAdmin } from '../../../access/isSystemAdmin';
import { getCollectionIDType } from '../../../utilities/getCollectionIDType';
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs';

export const readAccess: Access<User> = ({ req, id }) => {
  if (!req?.user) {
    return false;
  }

  // Check if user is from 'users' collection before passing to functions
  if (req.user && 'email' in req.user) {
    if (isAccessingSelf({ id, user: req.user })) {
      return true;
    }

    const systemAdmin = isSystemAdmin(req.user);

    // System admins can see all users - return empty object to bypass all filters
    if (systemAdmin) {
      return true;
    }

    const selectedTenant = getTenantFromCookie(
      req.headers,
      getCollectionIDType({ payload: req.payload, collectionSlug: 'websites' }),
    );
    const adminTenantAccessIDs = getUserTenantIDs(req.user, 'site-admin');

    if (selectedTenant) {
      // If they have access to the tenant ID set in cookie
      const hasTenantAccess = adminTenantAccessIDs.some((id) => id === selectedTenant);
      if (hasTenantAccess) {
        return {
          'tenants.tenant': {
            equals: selectedTenant,
          },
        };
      }
    }

    return {
      or: [
        {
          id: {
            equals: req.user.id,
          },
        },
        {
          'tenants.tenant': {
            in: adminTenantAccessIDs,
          },
        },
      ],
    } as Where;
  }

  return false;
};
