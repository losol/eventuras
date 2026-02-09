import { text, timestamp, uuid, index, unique } from 'drizzle-orm/pg-core';
import { idem, accounts } from './account';
import { oauthClients } from './oauth';

/**
 * ADR 0018: Per-Client Role-Based Access Control
 *
 * Implements Casbin's RBAC with Domains pattern where:
 * - Domain = OAuth client (identified by client_id)
 * - Roles are defined per-client in client_roles
 * - Users are granted roles via role_grants (g = user, role, domain)
 */

/**
 * Client Roles table
 *
 * Defines available roles for each OAuth client.
 * Each client can define its own set of roles with different meanings.
 *
 * Examples:
 * - idem-admin: systemadmin, admin_reader
 * - argo-cd: admin, readonly
 * - grafana: admin, editor, viewer
 */
export const clientRoles = idem.table(
  'client_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to OAuth client
    oauthClientId: uuid('oauth_client_id')
      .notNull()
      .references(() => oauthClients.id, { onDelete: 'cascade' }),

    // Role identification
    roleName: text('role_name').notNull(),
    description: text('description'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    // Unique role name per client
    unique('idx_client_roles_unique').on(table.oauthClientId, table.roleName),
    // Fast lookup by client
    index('idx_client_roles_client').on(table.oauthClientId),
  ]
);

/**
 * Role Grants table
 *
 * Maps users to roles for specific clients.
 * Equivalent to Casbin's g = user, role, domain
 *
 * Only users with systemadmin role for idem-admin can create/modify grants.
 */
export const roleGrants = idem.table(
  'role_grants',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // The user receiving the role
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),

    // The role being granted
    clientRoleId: uuid('client_role_id')
      .notNull()
      .references(() => clientRoles.id, { onDelete: 'cascade' }),

    // Audit trail
    grantedAt: timestamp('granted_at').notNull().defaultNow(),
    grantedBy: uuid('granted_by').references(() => accounts.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    // Prevent duplicate grants
    unique('idx_role_grants_unique').on(table.accountId, table.clientRoleId),
    // Fast lookup by account (for token generation)
    index('idx_role_grants_account').on(table.accountId),
  ]
);
