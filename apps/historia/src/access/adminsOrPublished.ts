import type { Access } from 'payload';

import { checkRole } from '../collections/Users/checkRole';

export const adminsOrPublished: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
