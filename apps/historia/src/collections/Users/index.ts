import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields';
import type { CollectionConfig } from 'payload';

import { createVippsAuthStrategy } from '@eventuras/payload-vipps-auth';

import { createAccess } from './access/create';
import { readAccess } from './access/read';
import { updateAndDeleteAccess } from './access/updateAndDelete';
import { createVerifiedFieldAccess, verificationFlagAccess } from './access/verifiedFieldAccess';
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin';
import { setCookieBasedOnDomain } from './hooks/setCookieBasedOnDomain';
import { adminsFieldLevel } from '../../access/admins';
import { isSystemAdmin } from '../../access/isSystemAdmin';
import { addressFields } from '../../fields/address';

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'websites',
  arrayFieldAccess: {},
  tenantFieldAccess: {},
  rowFields: [
    {
      name: 'siteRoles',
      type: 'select',
      defaultValue: ['member'],
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Commerce', value: 'commerce' },
        { label: 'Member', value: 'member' },
      ],
      required: true,
      admin: {
        description: 'Site-specific roles. Users can have multiple roles on a website.',
      },
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
  auth: {
    strategies: [createVippsAuthStrategy()],
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    useSessions: true,
    useAPIKey: true,
  },
  fields: [
    {
      label: 'Name',
      type: 'collapsible',
      fields: [
        {
          name: 'given_name',
          label: 'Given Name',
          type: 'text',
          access: createVerifiedFieldAccess('name_verified'),
        },
        {
          name: 'middle_name',
          label: 'Middle Name',
          type: 'text',
          access: createVerifiedFieldAccess('name_verified'),
        },
        {
          name: 'family_name',
          label: 'Family Name',
          type: 'text',
          access: createVerifiedFieldAccess('name_verified'),
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      access: createVerifiedFieldAccess('email_verified'),
    },
    {
      name: 'email_verified',
      type: 'checkbox',
      defaultValue: false,
      access: verificationFlagAccess,
      admin: {
        description: 'Indicates if the user\'s email has been verified by a trusted identity provider',
        position: 'sidebar',
      },
    },
    {
      name: 'name_verified',
      type: 'checkbox',
      defaultValue: false,
      access: verificationFlagAccess,
      admin: {
        description: 'Indicates if the user\'s name has been verified by a trusted identity provider',
        position: 'sidebar',
      },
    },
    {
      name: 'phone_number',
      type: 'text',
      access: createVerifiedFieldAccess('phone_number_verified'),
    },
    {
      name: 'phone_number_verified',
      type: 'checkbox',
      defaultValue: false,
      access: verificationFlagAccess,
      admin: {
        description: 'Indicates if the user\'s phone number has been verified.',
        position: 'sidebar',
      },
    },
    {
      name: 'addresses',
      type: 'array',
      label: 'Addresses',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          admin: {
            description: 'E.g. "Home", "Work", "Vipps", "Cabin"',
          },
        },
        {
          name: 'isDefault',
          type: 'checkbox',
          label: 'Default Address',
          defaultValue: false,
        },
        ...addressFields(),
      ],
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        {
          label: 'System Admin',
          value: 'system-admin',
        },
      ],
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      access: {
        create: adminsFieldLevel,
        read: adminsFieldLevel,
        update: adminsFieldLevel,
      },
      admin: {
        description: 'Global system administrator role. Only system admins can assign this role.',
      },
    },
    {
      ...defaultTenantArrayField,
      required: false,
      admin: {
        ...(defaultTenantArrayField?.admin ?? {}),
        position: 'sidebar',
        description: 'Optional: Assign user to specific websites/tenants. Leave empty for global access.',
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterLogin: [setCookieBasedOnDomain],
    beforeOperation: [
      ({ args, operation }) => {
        // Bypass tenant filtering for system admins on read operations
        // Check if user is from 'users' collection before passing to isSystemAdmin
        if (operation === 'read' && args.req?.user && 'email' in args.req.user && isSystemAdmin(args.req.user)) {
          // Set flag to bypass tenant scope
          args.req.context = args.req.context || {};
          args.req.context.disableMultiTenant = true;
        }
        return args;
      },
    ],
  },
};
