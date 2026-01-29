import { text, timestamp, uuid, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { idem, accounts } from './core';

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
    // Critical index for node-oidc-provider lookups
    index('idx_oidc_store_name_oidc_id').on(table.name, table.oidcId),

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

/**
 * Express Sessions table
 *
 * Stores Express session data for authentication flows.
 * Used by express-session middleware.
 */
export const expressSessions = idem.table(
  'express_sessions',
  {
    sid: text('sid').primaryKey(),

    // Session data (JSONB)
    sess: jsonb('sess').notNull(),

    // Expiration
    expire: timestamp('expire').notNull(),
  },
  (table) => [
    index('idx_express_sessions_expire').on(table.expire),
  ]
);

/**
 * Session fingerprints table
 *
 * Stores session fingerprints for session hijacking detection.
 */
export const sessionFingerprints = idem.table(
  'session_fingerprints',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Session identification
    sessionId: text('session_id').notNull(),

    // Fingerprint data
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userAgentHash: text('user_agent_hash'), // Hash for quick comparison

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),

    // Violation tracking
    violationCount: integer('violation_count').notNull().default(0),
    lastViolationAt: timestamp('last_violation_at'),
  },
  (table) => [
    index('idx_session_fingerprints_session').on(table.sessionId),
    index('idx_session_fingerprints_ip').on(table.ipAddress),
  ]
);
