import type { Access } from 'payload';

import { isSystemAdmin } from '../../../access/isSystemAdmin';
import type { User } from '../../../payload-types';
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs';

export const createAccess: Access<User> = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSystemAdmin(req.user)) {
    return true;
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'site-admin');

  if (adminTenantAccessIDs.length) {
    return true;
  }

  return false;
};
