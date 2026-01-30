import { text, timestamp, uuid, index, jsonb } from 'drizzle-orm/pg-core';
import { idem } from './account';
import { accounts } from './account';

/**
 * Account Claims table
 *
 * Stores verified claims from external identity providers (Vipps, HelseID, etc.).
 * Uses standard OIDC terminology.
 *
 * Note: Profile fields (givenName, familyName, etc.) are now stored directly on
 * the accounts table. This table is specifically for verified claims from IdPs.
 */
export const accountClaims = idem.table(
  'account_claims',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),

    // Claim details (standard OIDC terminology)
    claimType: text('claim_type').notNull(),
    // Standard OIDC claims: 'sub', 'email', 'phone_number', 'address'
    // Custom Norwegian claims: 'no:national_id', 'no:security_level', 'no:hpr_number'

    claimValue: jsonb('claim_value').notNull(),
    // Examples:
    // - 'address': { street_address: "...", locality: "...", postal_code: "...", country: "NO" }
    // - 'no:national_id': { value: "12345678901" }
    // - 'email': { value: "user@example.com", verified: true }
    // - 'phone_number': { value: "+4712345678", verified: true }

    // Source tracking
    sourceProvider: text('source_provider').notNull(), // 'vipps', 'helseid', 'google', etc.
    sourceVerifiedAt: timestamp('source_verified_at'),

    // Audit trail - raw claims from IdP (for debugging/audit)
    rawClaims: jsonb('raw_claims'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_account_claims_account').on(table.accountId),
    index('idx_account_claims_type').on(table.claimType),
    index('idx_account_claims_provider').on(table.sourceProvider),
  ]
);
