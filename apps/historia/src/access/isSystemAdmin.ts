import type { Access } from 'payload';

import { User } from '../payload-types';

export const isSystemAdminAccess: Access = ({ req }): boolean => {
  return isSystemAdmin(req.user);
};

export const isSystemAdmin = (user: User | null): boolean => {
  return Boolean(user?.roles?.includes('system-admin'));
};
