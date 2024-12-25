import { postgresAdapter } from '@payloadcms/db-postgres';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';
import { s3Adapter } from "@payloadcms/plugin-cloud-storage/s3";

import sharp from 'sharp';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Users } from './collections/Users';
import { Footer } from './Footer/config';
import { Header } from './Header/config';
import { plugins } from './plugins';
import { defaultLexical } from '@/fields/defaultLexical';
import { Articles } from './collections/Articles';
import { Happenings } from './collections/Happenings';
import { Licenses } from './collections/Licenses';
import { Notes } from './collections/Notes';
import { Organizations } from './collections/Organizations';
import { Persons } from './collections/Persons';
import { Places } from './collections/Places';
import { Topics } from './collections/Topics';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    idType: "uuid",
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [Articles, Happenings, Licenses, Media, Notes, Organizations, Pages, Persons, Places, Topics, Users],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    cloudStorage({
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
    nestedDocsPlugin({
      collections: ['pages'],
      parentFieldSlug: 'parent',
      breadcrumbsFieldSlug: 'breadcrumbs',
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
    redirectsPlugin({
      collections: ['articles', 'pages'],
    }),
  ],
  rateLimit: {
    max: 5000, // limit each IP per windowMs
    trustProxy: true,
    window: 60 * 1000, // 1 minute
  },
  secret: process.env.CMS_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
