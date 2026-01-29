import { text, timestamp, uuid, boolean, index, unique, pgSchema } from 'drizzle-orm/pg-core';

/**
 * Idem PostgreSQL schema
 */
export const idem = pgSchema('idem');

/**
 * Core table: Accounts
 *
 * Represents a user account in Idem.
 * One account can have multiple identities (Vipps, Google, HelseID, etc.)
 */
export const accounts = idem.table(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Primary email for the account
    primaryEmail: text('primary_email').notNull(),

    // Display name
    displayName: text('display_name').notNull(),

    // Account status
    active: boolean('active').notNull().default(true),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    // Soft delete
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    unique('idx_accounts_primary_email').on(table.primaryEmail),
    index('idx_accounts_active').on(table.active),
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
