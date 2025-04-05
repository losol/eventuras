import type { InferSelectModel } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import pg from 'pg';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

const pool = new pg.Pool({
  connectionString: Environment.get(EnvironmentVariables.SESSION_DATABASE_URL),
});
export const db = drizzle(pool);

export const authUserTable = pgTable('authUser', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  providerName: text('provider_name').notNull(),
  providerUserId: text('provider_user_id').notNull(),
});

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => authUserTable.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export type User = InferSelectModel<typeof authUserTable>;
export type Session = InferSelectModel<typeof sessionTable>;
