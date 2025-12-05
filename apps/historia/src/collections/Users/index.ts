import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields';
import type { CollectionConfig } from 'payload';

import { createAccess } from './access/create';
import { readAccess } from './access/read';
import { updateAndDeleteAccess } from './access/updateAndDelete';
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin';
import { setCookieBasedOnDomain } from './hooks/setCookieBasedOnDomain';
import { admins, adminsFieldLevel } from '../../access/admins';

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'websites',
  arrayFieldAccess: {},
  tenantFieldAccess: {},
  rowFields: [
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['site-member'],
      hasMany: true,
      options: ['site-admin', 'site-member'],
      required: true,
    },
  ],
});

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: createAccess,
    delete: () => false,
    read: readAccess,
    update: updateAndDeleteAccess,
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
          label: 'system-admin',
          value: 'system-admin',
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
    {
      ...defaultTenantArrayField,
      admin: {
        ...(defaultTenantArrayField?.admin ?? {}),
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  // The following hook sets a cookie based on the domain a user logs in from.
  // It checks the domain and matches it to a tenant in the system, then sets
  // a 'historia-tenant' cookie for that tenant.

  hooks: {
    afterLogin: [setCookieBasedOnDomain],
  },
};
