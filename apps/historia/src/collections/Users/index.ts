import type { CollectionConfig } from 'payload';

import { admins, adminsFieldLevel } from '../../access/admins';
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: admins,
    delete: admins,
    read: admins,
    update: admins,
  },
  admin: {
    defaultColumns: ['email'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      label: 'Name',
      type: 'collapsible',
      fields: [
        {
          name: 'given_name',
          label: 'Given Name',
          type: 'text',
        },
        {
          name: 'middle_name',
          label: 'Middle Name',
          type: 'text',
        },
        {
          name: 'family_name',
          label: 'Family Name',
          type: 'text',
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'email_verified', type: 'checkbox', access: {
        create: adminsFieldLevel,
        read: adminsFieldLevel,
        update: adminsFieldLevel
      }
    },
    // phone number
    {
      name: 'phone_number',
      type: 'text',
    },
    {
      name: 'phone_number_verified',
      type: 'checkbox',
      access: {
        create: adminsFieldLevel,
        read: adminsFieldLevel,
        update: adminsFieldLevel,
      },
    },
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
  timestamps: true,
};
