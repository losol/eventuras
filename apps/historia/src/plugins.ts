/**
 * Payload CMS Plugins Configuration
 *
 * Centralized configuration for all Payload plugins used in Historia.
 */

import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { importExportPlugin } from '@payloadcms/plugin-import-export';
import { mcpPlugin } from '@payloadcms/plugin-mcp';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';
import { searchPlugin } from '@payloadcms/plugin-search';
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { Plugin } from 'payload';

import { vippsAuthPlugin } from '@eventuras/payload-vipps-auth';

import { isSystemAdmin } from '@/access/isSystemAdmin';
import { revalidateRedirects } from '@/hooks/revalidateRedirects';
import { Config } from '@/payload-types';
import { beforeSyncWithSearch } from '@/search/beforeSync';
import { searchFields } from '@/search/fieldOverrides';
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs';

const requiredS3MediaVars = [
  'CMS_MEDIA_S3_ACCESS_KEY_ID',
  'CMS_MEDIA_S3_ENDPOINT',
  'CMS_MEDIA_S3_SECRET_ACCESS_KEY',
  'CMS_MEDIA_S3_REGION',
  'CMS_MEDIA_S3_BUCKET',
];

const areAllS3VarsPresent = requiredS3MediaVars.every((varName) => process.env[varName]);

export const plugins: Plugin[] = [
  importExportPlugin({
    collections: ['articles', 'notes', 'pages', 'users', 'orders'],
  }),
  mcpPlugin({
    collections: {
      articles: {
        enabled: true,
      },
      happenings: {
        enabled: true,
      },
      pages: {
        enabled: true,
      },
      notes: {
        enabled: true,
      },
      persons: {
        enabled: true,
      },
      organizations: {
        enabled: true,
      },
      topics: {
        enabled: true,
      },
      websites: {
        enabled: true,
      },
    },
  }),
  s3Storage({
    enabled: areAllS3VarsPresent,
    collections: {
      media: true,
    },
    bucket: process.env.CMS_MEDIA_S3_BUCKET!,
    config: {
      credentials: {
        accessKeyId: process.env.CMS_MEDIA_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CMS_MEDIA_S3_SECRET_ACCESS_KEY!,
      },
      endpoint: process.env.CMS_MEDIA_S3_ENDPOINT!,
      region: process.env.CMS_MEDIA_S3_REGION!,
    },
  }),
  redirectsPlugin({
    collections: ['articles', 'notes', 'pages'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            };
          }
          return field;
        });
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  multiTenantPlugin<Config>({
    tenantsSlug: 'websites',
    cleanupAfterTenantDelete: false,
    collections: {
      articles: {},
      carts: {},
      cases: {},
      happenings: {},
      notes: {},
      orders: {},
      pages: {},
      products: {},
      quotes: {},
      shipments: {},
      sources: {},
      terms: {},
      timelines: {},
      topics: {},
      transactions: {},
    },
    tenantField: {
      access: {
        read: () => true,
        update: ({ req }) => {
          // Check if user is from 'users' collection before passing to functions
          if (req.user && 'email' in req.user) {
            if (isSystemAdmin(req.user)) {
              return true;
            }
            return getUserTenantIDs(req.user).length > 0;
          }
          return false;
        },
      },
    },
    tenantsArrayField: {
      includeDefaultField: false,
    },
    useUsersTenantFilter: false,
    userHasAccessToAllTenants: (user) => {
      // Check if user is from 'users' collection before passing to isSystemAdmin
      return user && 'email' in user && isSystemAdmin(user);
    },
  }),
  nestedDocsPlugin({
    collections: ['pages'],
    generateLabel: (_, doc) => doc.title as string,
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ];
                },
              }),
            };
          }
          return field;
        });
      },
    },
  }),
  searchPlugin({
    collections: ['articles', 'notes', 'pages'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields];
      },
    },
  }),
  vippsAuthPlugin({
    enabled: process.env.VIPPS_LOGIN_ENABLED === 'true',
    environment: process.env.VIPPS_LOGIN_ENVIRONMENT === 'production' ? 'production' : 'test',
    clientId: process.env.VIPPS_LOGIN_CLIENT_ID!,
    clientSecret: process.env.VIPPS_LOGIN_CLIENT_SECRET!,

    mapVippsUser: (vippsUser) => ({
      email: vippsUser.email,
      email_verified: vippsUser.email_verified,
      given_name: vippsUser.given_name,
      middle_name: null, // Vipps doesn't provide middle_name as separate field
      family_name: vippsUser.family_name,
      name_verified: true,
      phone_number: vippsUser.phone_number,
      phone_number_verified: vippsUser.phone_number_verified,
      // Map Vipps addresses to Payload addresses array
      addresses: vippsUser.addresses?.map((addr) => ({
        label: addr.address_type || 'Vipps',
        isDefault: false,
        street_address: addr.street_address,
        postal_code: addr.postal_code,
        region: addr.region,
        country: addr.country,
      })),
    }),
  }),
];
