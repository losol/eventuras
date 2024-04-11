import { CollectionConfig } from 'payload/types';

import { admins } from '../../access/admins';
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: admins,
    create: admins,
    update: admins,
    delete: admins,
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['user'],
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'user',
          value: 'user',
        },
      ],
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },

    },
  ],
};
