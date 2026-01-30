import { text, timestamp, uuid, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { idem, accounts } from './account';

/**
 * Audit Log table
 *
 * Comprehensive audit trail for security-sensitive operations.
 */
export const auditLog = idem.table(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Event details
    eventType: text('event_type').notNull(),
    // 'account.created', 'account.deleted', 'identity.linked', 'token.issued',
    // 'admin.action', 'idp.auth_failed', 'session.created', etc.

    eventCategory: text('event_category').notNull(),
    // 'authentication', 'authorization', 'account', 'admin', 'security'

    // Actor (who performed the action)
    actorType: text('actor_type').notNull(), // 'account', 'system', 'admin', 'idp'
    actorId: uuid('actor_id').references(() => accounts.id, { onDelete: 'set null' }),
    actorName: text('actor_name'),

    // Target (what was affected)
    targetType: text('target_type'), // 'account', 'client', 'token', 'session'
    targetId: text('target_id'),
    targetName: text('target_name'),

    // Context
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    sessionId: text('session_id'),

    // Result
    success: text('success').notNull(), // 'success', 'failure', 'partial'
    errorCode: text('error_code'),
    errorMessage: text('error_message'),

    // Additional data (JSONB for flexibility)
    // IMPORTANT: Must be sanitized to remove secrets/tokens/PII
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    // Timestamps
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_log_event_type').on(table.eventType),
    index('idx_audit_log_event_category').on(table.eventCategory),
    index('idx_audit_log_actor').on(table.actorId),
    index('idx_audit_log_target').on(table.targetType, table.targetId),
    index('idx_audit_log_timestamp').on(table.timestamp),
    index('idx_audit_log_ip').on(table.ipAddress),
  ]
);

/**
 * Cleanup Runs table
 *
 * Tracks scheduled cleanup jobs for tokens, sessions, etc.
 */
export const cleanupRuns = idem.table(
  'cleanup_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Cleanup type
    cleanupType: text('cleanup_type').notNull(),
    // 'expired_tokens', 'consumed_tokens', 'expired_sessions', 'expired_otp',
    // 'expired_idp_states', 'expired_id_tokens'

    // Status
    status: text('status').notNull(), // 'running', 'completed', 'failed'

    // Results
    itemsProcessed: integer('items_processed').notNull().default(0),
    itemsDeleted: integer('items_deleted').notNull().default(0),
    itemsFailed: integer('items_failed').notNull().default(0),

    // Execution details
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    durationMs: integer('duration_ms'),

    // Error tracking
    errorMessage: text('error_message'),
    errorStack: text('error_stack'),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  },
  (table) => [
    index('idx_cleanup_runs_type').on(table.cleanupType),
    index('idx_cleanup_runs_status').on(table.status),
    index('idx_cleanup_runs_started').on(table.startedAt),
  ]
);

/**
 * System Health table
 *
 * Tracks system health metrics and status.
 */
export const systemHealth = idem.table(
  'system_health',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Health check type
    checkType: text('check_type').notNull(),
    // 'database', 'oidc_store_size', 'rate_limits', 'idp_connectivity'

    // Status
    status: text('status').notNull(), // 'healthy', 'degraded', 'unhealthy'

    // Metrics
    value: text('value'),
    threshold: text('threshold'),

    // Message
    message: text('message'),

    // Timestamps
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => [
    index('idx_system_health_type').on(table.checkType),
    index('idx_system_health_status').on(table.status),
    index('idx_system_health_timestamp').on(table.timestamp),
  ]
);
