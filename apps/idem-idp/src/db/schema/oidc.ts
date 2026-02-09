import { text, timestamp, uuid, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { idem, accounts } from './account';

/**
 * OIDC Store table
 *
 * Unified storage for node-oidc-provider tokens and state.
 * Stores authorization codes, access tokens, refresh tokens, etc.
 */
export const oidcStore = idem.table(
  'oidc_store',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Type of OIDC entity
    name: text('name').notNull(),
    // 'Session', 'AccessToken', 'AuthorizationCode', 'RefreshToken',
    // 'DeviceCode', 'BackchannelAuthenticationRequest', 'PushedAuthorizationRequest', etc.

    // OIDC provider ID (combines name + id for lookups)
    oidcId: text('oidc_id').notNull(),

    // Relationships
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),
    clientId: text('client_id'),
    grantId: text('grant_id'),
    sessionId: text('session_id'),

    // Token metadata
    scope: text('scope'),
    uid: text('uid'), // User code for device flow

    // Payload (JSONB for flexibility)
    payload: jsonb('payload').notNull(),

    // Lifecycle
    expiresAt: timestamp('expires_at').notNull(),
    consumedAt: timestamp('consumed_at'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    // UNIQUE constraint for oidc-provider adapter upsert
    unique('idx_oidc_store_name_oidc_id_unique').on(table.name, table.oidcId),

    // Grant-based revocation
    index('idx_oidc_store_grant').on(table.grantId),

    // Session-based logout fan-out
    index('idx_oidc_store_session').on(table.sessionId),

    // User code lookup (device flow)
    index('idx_oidc_store_uid').on(table.uid),

    // Token expiration queries (with partial index)
    index('idx_oidc_store_expires').on(table.expiresAt),

    // Account-based queries
    index('idx_oidc_store_account').on(table.accountId),
  ]
);
