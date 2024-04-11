import { webpackBundler } from '@payloadcms/bundler-webpack';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { payloadCloud } from '@payloadcms/plugin-cloud';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload/config';

import { Happenings } from './collections/Happenings';
import { Places } from './collections/Places';
import { Users } from './collections/Users';
import { Licenses } from './collections/Licenses';
import { Media } from './collections/Media';
import { People } from './collections/People';
import { Organizations } from './collections/Organizations';
import { Notes } from './collections/Notes';
import { Articles } from './collections/Articles';

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: lexicalEditor({}),
  collections: [Articles, Happenings, Licenses, Media, Notes, Organizations, People, Places, Users],
  serverURL: process.env.CMS_SERVER_URL || 'http://localhost:3300',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [payloadCloud()],
  db: postgresAdapter({
    idType: "uuid",
    pool: {
      connectionString: process.env.CMS_DATABASE_URL,
    },
  }),
});
