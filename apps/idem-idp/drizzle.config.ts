import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.IDEM_DATABASE_URL || 'postgresql://idem:idem@localhost:5432/idem',
  },
  verbose: true,
  strict: true,
});
