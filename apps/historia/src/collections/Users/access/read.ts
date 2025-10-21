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
