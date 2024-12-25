import { postgresAdapter } from '@payloadcms/db-postgres';


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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);


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
  db: postgresAdapter({
    idType: "uuid",
    pool: {
      connectionString: process.env.CMS_DATABASE_URL || '',
    },
  }),
  collections: [Articles, Happenings, Licenses, Media, Notes, Organizations, Pages, Persons, Places, Topics, Users],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: defaultLexical,
  plugins: [
    ...plugins // add more plugins to src/plugins/index.ts,
  ],
  secret: process.env.CMS_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
