import { text, timestamp, uuid, boolean, index, unique, pgSchema, date, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Idem PostgreSQL schema
 */
export const idem = pgSchema('idem');

/**
 * Core table: Accounts
 *
 * Represents a user account in Idem.
 * One account can have multiple identities (Vipps, Google, HelseID, etc.)
 * Profile fields and system role are merged into this table for simplicity (single-tenant).
 */
export const accounts = idem.table(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core identity
    primaryEmail: text('primary_email').notNull(),
    active: boolean('active').notNull().default(true),

    // Profile fields
    givenName: text('given_name'),
    middleName: text('middle_name'),
    familyName: text('family_name'),
    displayName: text('display_name').notNull(),
    phone: text('phone'),
    birthdate: date('birthdate'),
    locale: text('locale').default('nb-NO'),
    timezone: text('timezone').default('Europe/Oslo'),
    picture: text('picture'),

    // System role (merged from admin_principals + admin_memberships)
    systemRole: text('system_role'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    // Soft delete
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    unique('idx_accounts_primary_email').on(table.primaryEmail),
    index('idx_accounts_active').on(table.active),
    // CHECK constraint: systemRole can only be NULL, 'system_admin', or 'admin_reader'
    check('valid_system_role', sql`system_role IS NULL OR system_role IN ('system_admin', 'admin_reader')`),
  ]
);

/**
 * Core table: Identities
 *
 * Links external identity providers to local accounts.
 * One account can have multiple identities (e.g., Vipps + Google + email).
 */
export const identities = idem.table(
  'identities',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),

    // Provider information
    provider: text('provider').notNull(), // 'vipps', 'helseid', 'google', 'facebook', 'discord', 'github', 'email_otp'
    providerSubject: text('provider_subject').notNull(), // Unique ID from provider
    providerIssuer: text('provider_issuer'), // Issuer URL (for OIDC providers)

    // Identity metadata
    isPrimary: boolean('is_primary').notNull().default(false),

    // Verified status
    emailVerified: boolean('email_verified').default(false),
    phoneVerified: boolean('phone_verified').default(false),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at'),
  },
  (table) => [
    index('idx_identities_account').on(table.accountId),
    unique('idx_identities_provider_subject').on(
      table.provider,
      table.providerSubject
    ),
    index('idx_identities_primary').on(table.accountId, table.isPrimary),
  ]
);

/**
 * Core table: Emails
 *
 * Email addresses associated with accounts.
 * Used for OTP authentication and notifications.
 */
export const emails = idem.table(
  'emails',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),

    // Email details
    email: text('email').notNull(),
    verified: boolean('verified').notNull().default(false),
    isPrimary: boolean('is_primary').notNull().default(false),

    // Verification
    verificationToken: text('verification_token'),
    verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
    verifiedAt: timestamp('verified_at'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_emails_account').on(table.accountId),
    unique('idx_emails_email').on(table.email),
    index('idx_emails_verified').on(table.verified),
  ]
);
