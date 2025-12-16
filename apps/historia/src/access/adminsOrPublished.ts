import type { Access } from 'payload';

import { checkRole } from '../collections/Users/checkRole';

export const adminsOrPublished: Access = ({ req: { user } }) => {
  // Check if user is from 'users' collection (has email property) before passing to checkRole
  if (user && 'email' in user && checkRole(['admin'], user)) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
