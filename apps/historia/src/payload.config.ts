import { randomBytes } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { defaultLexical } from '@/fields/defaultLexical';

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
import { migrations } from './migrations';
import { plugins } from './plugins';

const locales = process.env.NEXT_PUBLIC_CMS_LOCALES ? process.env.NEXT_PUBLIC_CMS_LOCALES.split(',') : ['en'];
const defaultLocale = process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE ?? 'en';
const allowedOrigins = process.env.CMS_ALLOWED_ORIGINS ? process.env.CMS_ALLOWED_ORIGINS.split(',') : [];

// Detect if we're in build mode (no database needed)
const isBuildMode = process.env.NEXT_PHASE === 'phase-production-build' || process.env.PAYLOAD_DROP_DATABASE === 'true';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const cmsDatabaseUrl = process.env.CMS_DATABASE_URL || 'file:./historia.db';
// Use SQLite during build mode to avoid needing PostgreSQL connection
const isPostgres = !isBuildMode && (cmsDatabaseUrl.startsWith('postgres://') || cmsDatabaseUrl.startsWith('postgresql://'));
// Use a temporary SQLite database during build
const buildDatabaseUrl = isBuildMode ? 'file:./.historia-build.db' : cmsDatabaseUrl;

// Email configuration - controlled by FEATURE_SMTP flag
const smtpEnabled = process.env.FEATURE_SMTP === 'enabled';

// Validate SMTP credentials when SMTP is enabled
if (smtpEnabled) {
  const missingCredentials = [];
  if (!process.env.SMTP_USER) missingCredentials.push('SMTP_USER');
  if (!process.env.SMTP_PASS) missingCredentials.push('SMTP_PASS');

  if (missingCredentials.length > 0) {
    throw new Error(
      `SMTP is enabled (FEATURE_SMTP=enabled) but required credentials are missing: ${missingCredentials.join(', ')}. ` +
      'Either provide the missing environment variables or disable SMTP by removing FEATURE_SMTP.'
    );
  }
}

const emailAdapter = smtpEnabled
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM_EMAIL || 'noreply@eventuras.local',
      defaultFromName: process.env.SMTP_FROM_NAME || 'Historia',
      transportOptions: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    })
  : nodemailerAdapter({
      defaultFromAddress: 'noreply@eventuras.local',
      defaultFromName: 'Historia (Console Log)',
      // Log emails to console instead of sending
      transportOptions: {
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      },
    });

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      views: {
        packingQueue: {
          path: '/packing-queue',
          Component: '@/collections/Orders/views/PackingQueuePage',
          exact: true,
          meta: {
            title: 'Packing Queue',
            description: 'Orders ready to pack and ship',
          },
        },
      },
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
      // Never auto db push in production, even if HISTORIA_DB_DEV_PUSH is set
      push: process.env.NODE_ENV === 'production' ? false : process.env.HISTORIA_DB_DEV_PUSH === 'true',
      // Run migrations at runtime in production
      // https://payloadcms.com/docs/database/migrations#running-migrations-in-production
      prodMigrations: migrations,
    })
    : sqliteAdapter({
      idType: 'uuid',
      client: {
        url: buildDatabaseUrl,
      },
      push: true,
    }),
  collections: [Articles, BusinessEvents, Happenings, Licenses, Media, Notes, Orders, Organizations, Pages, Persons, Places, Products, Projects, Shipments, Topics, Transactions, Users, Websites],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: defaultLexical,
  email: emailAdapter,
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
