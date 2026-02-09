import { text, timestamp, uuid, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { idem } from './account';

/**
 * Sessions table
 *
 * Stores HTTP session data for authentication flows.
 * Used by @fastify/session middleware.
 */
export const sessions = idem.table(
  'sessions',
  {
    sid: text('sid').primaryKey(),

    // Session data (JSONB)
    sess: jsonb('sess').notNull(),

    // Expiration
    expire: timestamp('expire').notNull(),
  },
  (table) => [
    index('idx_sessions_expire').on(table.expire),
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
