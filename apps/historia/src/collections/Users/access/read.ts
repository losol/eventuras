import type { User } from '@/payload-types';
import type { Access, Where } from 'payload';
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities';

import { isSystemAdmin } from '../../../access/isSystemAdmin';
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs';
import { isAccessingSelf } from './isAccessingSelf';
import { getCollectionIDType } from '../../../utilities/getCollectionIDType';

export const readAccess: Access<User> = ({ req, id }) => {
  if (!req?.user) {
    return false;
  }

  if (isAccessingSelf({ id, user: req.user })) {
    return true;
  }

  const systemAdmin = isSystemAdmin(req.user);
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'websites' }),
  );
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'site-admin');

  if (selectedTenant) {
    // If it's a super admin, or they have access to the tenant ID set in cookie
    const hasTenantAccess = adminTenantAccessIDs.some((id) => id === selectedTenant);
    if (systemAdmin || hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      };
    }
  }

  if (systemAdmin) {
    return true;
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
};
