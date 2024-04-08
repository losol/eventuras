import { webpackBundler } from '@payloadcms/bundler-webpack';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { payloadCloud } from '@payloadcms/plugin-cloud';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { buildConfig } from 'payload/config';

import Happenings from './collections/Happenings';
import Places from './collections/Places';
import Users from './collections/Users';
import Licenses from './collections/Licenses';
import { Media } from './collections/Media';
import Persons from './collections/Persons';
import Organizations from './collections/Organizations';

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [Happenings, Licenses, Media, Organizations, Persons, Places, Users],
  serverURL: process.env.CMS_SERVER_URL || 'http://localhost:3200',
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
