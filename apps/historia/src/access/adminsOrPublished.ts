import type { Access } from 'payload';

import { isSystemAdmin } from './isSystemAdmin';

export const adminsOrPublished: Access = ({ req: { user } }) => {
  // System admins can see unpublished content
  if (user && 'email' in user && isSystemAdmin(user)) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
