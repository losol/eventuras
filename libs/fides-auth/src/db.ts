import type { InferSelectModel } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.SESSION_DATABASE_URL,
});
export const db = drizzle(pool);

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  providerName: text('provider_name').notNull(),
  providerUserId: text('provider_user_id').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // These fields will be updated with data from the id token
  givenName: text('given_name'),
  familyName: text('family_name'),
  nickname: text('nickname'),
  fullName: text('full_name'),
  picture: text('picture'),
  emailVerified: boolean('email_verified'),
  roles: text('roles').array(),
  identityUpdatedAt: timestamp('identity_updated_at'),
});

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => userTable.id),

  expiresAt: timestamp('expires_at').notNull(),

  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
