import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'

import Users from './collections/Users'
import Places from './collections/Places';

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [Places, Users],
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:3200',
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
      connectionString: process.env.PAYLOAD_DB_URL,
    },
  }),
})
