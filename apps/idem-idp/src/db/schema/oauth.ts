import { text, timestamp, uuid, jsonb, boolean, integer, index } from 'drizzle-orm/pg-core';
import { idem } from './account';

/**
 * OAuth Clients table
 *
 * Stores OAuth 2.0 / OIDC client configurations.
 */
export const oauthClients = idem.table(
  'oauth_clients',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Client identification (the OAuth client_id, distinct from the UUID id)
    clientId: text('client_id').notNull().unique(),
    clientName: text('client_name').notNull(),

    // Client secret (hashed with scrypt)
    clientSecretHash: text('client_secret_hash'), // Null for public clients

    // Client type
    clientType: text('client_type').notNull(), // 'confidential' or 'public'

    // Client category: 'internal' (first-party, no consent) or 'external' (third-party, consent required)
    clientCategory: text('client_category').notNull().default('internal'),

    // Redirect URIs
    redirectUris: text('redirect_uris').array().notNull(),

    // Grant types: authorization_code, refresh_token, client_credentials
    grantTypes: text('grant_types').array().notNull(),

    // Response types: code, id_token, token
    responseTypes: text('response_types').array().notNull(),

    // Scopes
    allowedScopes: text('allowed_scopes').array().notNull(),
    defaultScopes: text('default_scopes').array().notNull(),

    // PKCE
    requirePkce: boolean('require_pkce').notNull().default(true),

    // Token settings (in seconds)
    accessTokenLifetime: integer('access_token_lifetime').notNull().default(60), // 1 minute
    refreshTokenLifetime: integer('refresh_token_lifetime').notNull().default(43200), // 12 hours
    idTokenLifetime: integer('id_token_lifetime').notNull().default(3600), // 1 hour

    // Status
    active: boolean('active').notNull().default(true),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_oauth_clients_active').on(table.active),
  ]
);

/**
 * JWKS Keys table
 *
 * Stores JSON Web Keys for signing tokens.
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
