import { text, timestamp, uuid, index, unique } from 'drizzle-orm/pg-core';
import { idem, accounts } from './core';

/**
 * Admin Principals table
 *
 * Tracks administrative users (system admins, readers).
 * Links to accounts table for identity.
 */
export const adminPrincipals = idem.table(
  'admin_principals',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to account
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' })
      .unique(),

    // Display info (cached from account)
    displayName: text('display_name').notNull(),
    email: text('email').notNull(),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_admin_principals_email').on(table.email),
  ]
);

/**
 * Admin Memberships table
 *
 * Maps principals to global admin roles.
 * Single-tenant: Only 2 roles (system_admin, admin_reader).
 */
export const adminMemberships = idem.table(
  'admin_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to principal
    principalId: uuid('principal_id')
      .notNull()
      .references(() => adminPrincipals.id, { onDelete: 'cascade' }),

    // Global role
    role: text('role').notNull(),
    // 'system_admin' - full access to all operations
    // 'admin_reader' - read-only access to admin interfaces

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    grantedBy: uuid('granted_by').references(() => adminPrincipals.id, { onDelete: 'set null' }),
  },
  (table) => [
    unique('idx_admin_memberships_principal_role').on(
      table.principalId,
      table.role
    ),
    index('idx_admin_memberships_role').on(table.role),
  ]
);
