import type { Access } from 'payload';

import { User } from '../payload-types';

export const isSystemAdminAccess: Access = ({ req }): boolean => {
  // Check if user is from 'users' collection before passing to isSystemAdmin
  if (req.user && 'email' in req.user) {
    return isSystemAdmin(req.user as User);
  }
  return false;
};

export const isSystemAdmin = (user: User | null): boolean => {
  return Boolean(user?.roles?.includes('system-admin'));
};
