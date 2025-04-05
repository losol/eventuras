import { defineConfig } from 'drizzle-kit';

const db_url = process.env.SESSION_DATABASE_URL;

export default defineConfig({
  dbCredentials: {
    url: db_url!,
  },
  schema: './src/lib/auth/db.ts',
  dialect: 'postgresql',
  out: './migrations',
});
