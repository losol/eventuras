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

    // Client identification
    clientId: text('client_id').notNull().unique(),
    clientName: text('client_name').notNull(),

    // Client secret (hashed with scrypt)
    clientSecretHash: text('client_secret_hash'), // Null for public clients

    // Client type
    clientType: text('client_type').notNull(), // 'confidential' or 'public'

    // Redirect URIs (array stored as JSONB)
    redirectUris: jsonb('redirect_uris').notNull().$type<string[]>(),

    // Grant types
    grantTypes: jsonb('grant_types').notNull().$type<string[]>(),
    // ['authorization_code', 'refresh_token', 'client_credentials']

    // Response types
    responseTypes: jsonb('response_types').notNull().$type<string[]>(),
    // ['code', 'id_token', 'token']

    // Scopes
    allowedScopes: jsonb('allowed_scopes').notNull().$type<string[]>(),
    defaultScopes: jsonb('default_scopes').notNull().$type<string[]>(),

    // PKCE
    requirePkce: boolean('require_pkce').notNull().default(true),

    // Token settings (in seconds)
    accessTokenLifetime: integer('access_token_lifetime').notNull().default(3600), // 1 hour
    refreshTokenLifetime: integer('refresh_token_lifetime').notNull().default(2592000), // 30 days
    idTokenLifetime: integer('id_token_lifetime').notNull().default(3600), // 1 hour

    // Metadata
    logoUri: text('logo_uri'),
    clientUri: text('client_uri'),
    policyUri: text('policy_uri'),
    tosUri: text('tos_uri'),
    contacts: jsonb('contacts').$type<string[]>(),

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
