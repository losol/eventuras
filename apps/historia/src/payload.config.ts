import { randomBytes } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { defaultLexical } from '@/fields/defaultLexical';
import { seedDefaultWebsite } from '@/seed/defaultWebsite';

import { Articles } from './collections/Articles';
import { BusinessEvents } from './collections/BusinessEvents';
import { Happenings } from './collections/Happenings';
import { Licenses } from './collections/Licenses';
import { Media } from './collections/Media';
import { Notes } from './collections/Notes';
import { Orders } from './collections/Orders';
import { Organizations } from './collections/Organizations';
import { Pages } from './collections/Pages';
import { Persons } from './collections/Persons';
import { Places } from './collections/Places';
import { Products } from './collections/Products';
import { Projects } from './collections/Projects';
import { Shipments } from './collections/Shipments';
import { Topics } from './collections/Topics';
import { Transactions } from './collections/Transactions';
import { Users } from './collections/Users';
import { Websites } from './collections/Websites';
import { plugins } from './plugins';

const locales = process.env.NEXT_PUBLIC_CMS_LOCALES ? process.env.NEXT_PUBLIC_CMS_LOCALES.split(',') : ['en'];
const defaultLocale = process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE ?? 'en';
const allowedOrigins = process.env.CMS_ALLOWED_ORIGINS ? process.env.CMS_ALLOWED_ORIGINS.split(',') : [];

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const cmsDatabaseUrl = process.env.CMS_DATABASE_URL || 'file:./historia.db';
const isPostgres = cmsDatabaseUrl.startsWith('postgres://');

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
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
  db: isPostgres
    ? postgresAdapter({
      idType: 'uuid',
      pool: {
        connectionString: cmsDatabaseUrl,
      },
    })
    : sqliteAdapter({
      idType: 'uuid',
      client: {
        url: cmsDatabaseUrl
      },
      push: true,
    }),
  collections: [Articles, BusinessEvents, Happenings, Licenses, Media, Notes, Orders, Organizations, Pages, Persons, Places, Products, Projects, Shipments, Topics, Transactions, Users, Websites],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: defaultLexical,
  localization: {
    locales: locales,
    defaultLocale: defaultLocale,
    fallback: true,
  },
  i18n: {
    fallbackLanguage: 'en',
  },
  plugins: [
    ...plugins, // Additional plugins
  ],
  // Generate a random secret if CMS_SECRET is not provided (useful for build time)
  secret: process.env.CMS_SECRET || randomBytes(32).toString('hex'),
  serverURL: process.env.NEXT_PUBLIC_CMS_URL,
  sharp,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
