import { text, timestamp, uuid, date, index, jsonb } from 'drizzle-orm/pg-core';
import { idem } from './core';
import { accounts } from './core';

/**
 * Profile table: Person information
 *
 * Stores personal information for account profiles.
 * Data sourced from IdP claims or user input.
 */
export const profilePerson = idem.table(
  'profile_person',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' })
      .unique(),

    // Basic info
    givenName: text('given_name'),
    middleName: text('middle_name'),
    familyName: text('family_name'),
    displayName: text('display_name'),

    // Contact
    email: text('email'),
    phone: text('phone'),

    // Demographics
    birthdate: date('birthdate'),
    gender: text('gender'),
    locale: text('locale'),
    timezone: text('timezone'),

    // Profile
    picture: text('picture'), // URL to profile picture
    website: text('website'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_profile_person_account').on(table.accountId),
  ]
);

/**
 * Profile facts table
 *
 * Stores verified identity facts from IdPs (Vipps, HelseID).
 * This is separate from profile_person to keep verified claims isolated.
 */
export const profileFacts = idem.table(
  'profile_facts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),

    // Fact details
    factType: text('fact_type').notNull(), // 'national_id', 'security_level', 'hpr_number', etc.
    factValue: text('fact_value').notNull(),

    // Source
    sourceProvider: text('source_provider').notNull(), // 'vipps', 'helseid', etc.
    sourceVerifiedAt: timestamp('source_verified_at'),

    // Raw claims from provider (for audit)
    rawClaims: jsonb('raw_claims'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_profile_facts_account').on(table.accountId),
    index('idx_profile_facts_type').on(table.factType),
  ]
);

/**
 * Address table
 *
 * Stores address information for accounts.
 */
export const addresses = idem.table(
  'addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),

    // Address type
    addressType: text('address_type').notNull(), // 'home', 'work', 'billing', 'shipping'

    // Address fields
    streetAddress: text('street_address'),
    locality: text('locality'), // City
    region: text('region'), // State/province
    postalCode: text('postal_code'),
    country: text('country'), // ISO 3166-1 alpha-2

    // Formatted address
    formatted: text('formatted'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_addresses_account').on(table.accountId),
    index('idx_addresses_type').on(table.addressType),
  ]
);
