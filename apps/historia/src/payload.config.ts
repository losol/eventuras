import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { defaultLexical } from '@/fields/defaultLexical';

import { Articles } from './collections/Articles';
import { Happenings } from './collections/Happenings';
import { Licenses } from './collections/Licenses';
import { Media } from './collections/Media';
import { Notes } from './collections/Notes';
import { Organizations } from './collections/Organizations';
import { Pages } from './collections/Pages';
import { Persons } from './collections/Persons';
import { Places } from './collections/Places';
import { Projects } from './collections/Projects';
import { Topics } from './collections/Topics';
import { Users } from './collections/Users';
import { Websites } from './collections/Websites';
import { plugins } from './plugins';

const locales = process.env.CMS_LOCALES ? process.env.CMS_LOCALES.split(',') : ['en'];
const defaultLocale = process.env.CMS_DEFAULT_LOCALE ?? 'en';
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
      }
    }),
  collections: [Articles, Happenings, Licenses, Media, Notes, Organizations, Pages, Persons, Places, Projects, Topics, Users, Websites],
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
  secret: process.env.CMS_SECRET,
  serverURL: process.env.NEXT_PUBLIC_CMS_URL,
  sharp,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
