import type { Access } from 'payload';

import { isSystemAdmin } from '../../../access/isSystemAdmin';
import type { User } from '../../../payload-types';
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs';

export const createAccess: Access<User> = ({ req }) => {
  if (!req.user) {
    return false;
  }

  // Check if user is from 'users' collection before passing to isSystemAdmin
  if (req.user && 'email' in req.user && isSystemAdmin(req.user)) {
    return true;
  }

  // Only User types can have tenant access
  if (req.user && 'email' in req.user) {
    const adminTenantAccessIDs = getUserTenantIDs(req.user, 'admin');

    if (adminTenantAccessIDs.length) {
      return true;
    }
  }

  return false;
};
