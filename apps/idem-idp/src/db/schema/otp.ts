import { text, timestamp, uuid, integer, boolean, index, unique } from 'drizzle-orm/pg-core';
import { idem } from './core';
import { accounts } from './core';

/**
 * OTP table: One-Time Passwords
 *
 * Stores OTP codes for passwordless authentication via email or SMS.
 * Used for login flows where users receive a code via email/SMS.
 */
export const otpCodes = idem.table(
  'otp_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Recipient information
    recipient: text('recipient').notNull(), // Email or phone number
    recipientType: text('recipient_type').notNull(), // 'email' or 'sms'

    // OTP code (hashed for security)
    codeHash: text('code_hash').notNull(),

    // Optional account link (null if this is for account creation)
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),

    // Usage tracking
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(5),
    consumed: boolean('consumed').notNull().default(false),

    // Expiration
    expiresAt: timestamp('expires_at').notNull(),

    // Session/flow tracking
    sessionId: text('session_id'), // Link to OAuth session if part of login flow

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    consumedAt: timestamp('consumed_at'),
  },
  (table) => [
    index('idx_otp_recipient').on(table.recipient, table.recipientType),
    index('idx_otp_expires').on(table.expiresAt),
    index('idx_otp_consumed').on(table.consumed),
    index('idx_otp_session').on(table.sessionId),
  ]
);

/**
 * OTP rate limiting table
 *
 * Tracks OTP requests per recipient to prevent abuse.
 */
export const otpRateLimits = idem.table(
  'otp_rate_limits',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Recipient
    recipient: text('recipient').notNull(),
    recipientType: text('recipient_type').notNull(),

    // Rate limiting
    requestCount: integer('request_count').notNull().default(1),
    windowStart: timestamp('window_start').notNull().defaultNow(),
    windowEnd: timestamp('window_end').notNull(),

    // Block status
    blocked: boolean('blocked').notNull().default(false),
    blockedUntil: timestamp('blocked_until'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('idx_otp_ratelimit_recipient').on(table.recipient, table.recipientType),
    index('idx_otp_ratelimit_window').on(table.windowEnd),
    index('idx_otp_ratelimit_blocked').on(table.blocked, table.blockedUntil),
  ]
);
