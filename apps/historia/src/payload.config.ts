import { postgresAdapter } from '@payloadcms/db-postgres';


import sharp from 'sharp';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Users } from './collections/Users';
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
import { Projects } from './collections/Projects';

const locales = process.env.CMS_LOCALES ? process.env.CMS_LOCALES.split(',') : ['en'];
const defaultLocale = process.env.CMS_DEFAULT_LOCALE ?? 'en';
const allowedOrigins = process.env.CMS_ALLOWED_ORIGINS ? process.env.CMS_ALLOWED_ORIGINS.split(',') : [];

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
  db: postgresAdapter({
    idType: "uuid",
    pool: {
      connectionString: process.env.CMS_DATABASE_URL || '',
    },
  }),
  collections: [Articles, Happenings, Licenses, Media, Notes, Organizations, Pages, Persons, Places, Projects, Topics, Users],
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
    ...plugins // add more plugins to src/plugins/index.ts,
  ],
  secret: process.env.CMS_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
