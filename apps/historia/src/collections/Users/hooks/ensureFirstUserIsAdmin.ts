import type { FieldHook } from 'payload';

import type { User } from '../../../payload-types';

export const ensureFirstUserIsAdmin: FieldHook<User> = async ({ req, operation, value }) => {
  if (operation === 'create') {
    const users = await req.payload.find({ collection: 'users', limit: 0, depth: 0 });

    if (users.totalDocs === 0) {
      // First user must be system-admin
      return ['system-admin'];
    }
  }

  return value;
};
