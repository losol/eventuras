import type { Config } from 'drizzle-kit';

export default {
  schema: './apps/idem-idp/src/modules/db/schema.ts',
  out: './apps/idem-idp/src/modules/db/migrations',
  dialect: 'postgresql',
} satisfies Config;
