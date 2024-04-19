import { webpackBundler } from '@payloadcms/bundler-webpack';
import { postgresAdapter } from '@payloadcms/db-postgres';
import redirects from '@payloadcms/plugin-redirects';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload/config';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';
import { s3Adapter } from "@payloadcms/plugin-cloud-storage/s3";

import { Happenings } from './collections/Happenings';
import { Places } from './collections/Places';
import { Users } from './collections/Users';
import { Licenses } from './collections/Licenses';
import { Media } from './collections/Media';
import { Persons } from './collections/Persons';
import { Organizations } from './collections/Organizations';
import { Notes } from './collections/Notes';
import { Articles } from './collections/Articles';
import { Pages } from './collections/Pages';

const requiredS3MediaVars = [
  'CMS_MEDIA_S3_ACCESS_KEY_ID',
  'CMS_MEDIA_S3_ENDPOINT',
  'CMS_MEDIA_S3_SECRET_ACCESS_KEY',
  'CMS_MEDIA_S3_REGION',
  'CMS_MEDIA_S3_BUCKET'
];

const areAllS3VarsPresent = requiredS3MediaVars.every(varName => process.env[varName]);
const allowedOrigins = process.env.CMS_ALLOWED_ORIGINS ? process.env.CMS_ALLOWED_ORIGINS.split(',') : [];


export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  db: postgresAdapter({
    idType: "uuid",
    pool: {
      connectionString: process.env.CMS_DATABASE_URL,
    },
  }),
  editor: lexicalEditor({}),
  collections: [Articles, Happenings, Licenses, Media, Notes, Organizations, Pages, Persons, Places, Users],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  rateLimit: {
    max: 5000, // limit each IP per windowMs
    trustProxy: true,
    window: 60 * 1000, // 1 minute
  },
  serverURL: process.env.CMS_SERVER_URL || 'http://localhost:3300',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [cloudStorage({
    enabled: areAllS3VarsPresent,
    collections: {
      'media': {
        adapter: s3Adapter({
          config: {
            credentials: {
              accessKeyId: process.env.CMS_MEDIA_S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.CMS_MEDIA_S3_SECRET_ACCESS_KEY!,
            },
            endpoint: process.env.CMS_MEDIA_S3_ENDPOINT!,
            region: process.env.CMS_MEDIA_S3_REGION!,
          },
          bucket: process.env.CMS_MEDIA_S3_BUCKET!,
        })
      }
    }
  }),
  nestedDocs({
    collections: ['organizations', 'pages', 'places'],
  }),
  redirects({
    collections: ['articles', 'pages'],
  }),
  ],
});

