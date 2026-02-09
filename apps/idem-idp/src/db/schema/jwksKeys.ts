import { text, timestamp, uuid, jsonb, boolean, index } from 'drizzle-orm/pg-core';
import { idem } from './account';

/**
 * JWKS Keys table
 *
 * Stores JSON Web Keys for signing and encrypting tokens.
 * These are the IdP's own keys, not client keys.
 * Private keys are encrypted at application level.
 */
export const jwksKeys = idem.table(
  'jwks_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Key identification
    kid: text('kid').notNull().unique(), // Key ID

    // Key usage
    use: text('use').notNull(), // 'sig' for signatures, 'enc' for encryption
    alg: text('alg').notNull(), // 'RS256', 'ES256', etc.

    // Key type
    kty: text('kty').notNull(), // 'RSA', 'EC', 'oct'

    // Public key (JWK format)
    publicKey: jsonb('public_key').notNull(),

    // Private key (encrypted, JWK format)
    privateKeyEncrypted: text('private_key_encrypted').notNull(),

    // Status
    active: boolean('active').notNull().default(true),
    primary: boolean('primary').notNull().default(false),

    // Rotation tracking
    rotatedAt: timestamp('rotated_at'),
    expiresAt: timestamp('expires_at'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_jwks_keys_active').on(table.active),
    index('idx_jwks_keys_primary').on(table.primary),
    index('idx_jwks_keys_expires').on(table.expiresAt),
  ]
);
