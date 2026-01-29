import { text, timestamp, uuid, jsonb, boolean, integer, index, unique } from 'drizzle-orm/pg-core';
import { idem } from './core';

/**
 * IdP Providers table
 *
 * Registry of supported identity providers (Vipps, HelseID, social login).
 */
export const idpProviders = idem.table(
  'idp_providers',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Provider identification
    providerKey: text('provider_key').notNull().unique(),
    // 'vipps', 'helseid', 'google', 'facebook', 'discord', 'github'

    providerName: text('provider_name').notNull(),
    providerType: text('provider_type').notNull(),
    // 'oidc', 'oauth2', 'saml' (but we only support OIDC/OAuth2)

    // Provider metadata
    issuer: text('issuer'),
    authorizationEndpoint: text('authorization_endpoint'),
    tokenEndpoint: text('token_endpoint'),
    userinfoEndpoint: text('userinfo_endpoint'),
    jwksUri: text('jwks_uri'),

    // Display
    displayName: text('display_name').notNull(),
    logoUrl: text('logo_url'),
    buttonColor: text('button_color'),

    // Status
    enabled: boolean('enabled').notNull().default(true),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_idp_providers_enabled').on(table.enabled),
  ]
);

/**
 * IdP Configs table
 *
 * Environment-specific configurations for IdP providers.
 * One config per provider (single-tenant).
 */
export const idpConfigs = idem.table(
  'idp_configs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Link to provider
    providerId: uuid('provider_id')
      .notNull()
      .references(() => idpProviders.id, { onDelete: 'cascade' }),

    // Client credentials (encrypted)
    clientId: text('client_id').notNull(),
    clientSecretEncrypted: text('client_secret_encrypted').notNull(),

    // Scopes
    scopes: jsonb('scopes').notNull().$type<string[]>(),

    // Configuration
    redirectUri: text('redirect_uri').notNull(),
    additionalParams: jsonb('additional_params').$type<Record<string, string>>(),

    // Error tracking
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    lastFailureAt: timestamp('last_failure_at'),
    lastSuccessAt: timestamp('last_success_at'),

    // Status
    enabled: boolean('enabled').notNull().default(true),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('idx_idp_configs_provider').on(table.providerId),
    index('idx_idp_configs_enabled').on(table.enabled),
  ]
);

/**
 * IdP States table
 *
 * Tracks OAuth state parameters for security (CSRF protection).
 * Cleaned up after successful callback or expiration.
 */
export const idpStates = idem.table(
  'idp_states',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // State parameter
    state: text('state').notNull().unique(),

    // PKCE
    codeVerifier: text('code_verifier'),

    // Nonce (for OIDC)
    nonce: text('nonce'),

    // Provider
    providerId: uuid('provider_id')
      .notNull()
      .references(() => idpProviders.id, { onDelete: 'cascade' }),

    // Original request context
    returnTo: text('return_to'), // Original redirect after login
    sessionId: text('session_id'), // Link to OIDC session

    // Security
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // Status
    consumed: boolean('consumed').notNull().default(false),
    consumedAt: timestamp('consumed_at'),

    // Expiration
    expiresAt: timestamp('expires_at').notNull(),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_idp_states_provider').on(table.providerId),
    index('idx_idp_states_expires').on(table.expiresAt),
    index('idx_idp_states_consumed').on(table.consumed),
  ]
);

/**
 * Used ID Tokens table
 *
 * Prevents token replay attacks by tracking used ID tokens.
 * Tokens are stored by their JTI (JWT ID) claim.
 */
export const usedIdTokens = idem.table(
  'used_id_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Token identification
    jti: text('jti').notNull(),
    providerId: uuid('provider_id')
      .notNull()
      .references(() => idpProviders.id, { onDelete: 'cascade' }),

    // Token metadata
    subject: text('subject').notNull(),
    issuedAt: timestamp('issued_at').notNull(),
    expiresAt: timestamp('expires_at').notNull(),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique('idx_used_id_tokens_jti_provider').on(table.jti, table.providerId),
    index('idx_used_id_tokens_expires').on(table.expiresAt),
  ]
);
