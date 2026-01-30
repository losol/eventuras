# ADR 0006 — IdP Broker Model

## Status
Accepted (Updated 2026-01-30 for single-tenant architecture)

## Context
Users may authenticate via multiple external identity providers (Vipps, HelseID, ID-porten, etc.).

## Decision

### Single-Tenant Model (Updated 2026-01-30)

For Idem's single-tenant architecture serving Eventuras exclusively:

- Model upstream IdPs explicitly in the database (`idem.idp_providers`)
- Store provider metadata and configuration **in the same table** (no separate tenant bindings)
- Use `idem.identities` to link upstream identities to local accounts
- Track upstream failures directly on providers for operational monitoring

### Database Schema

```typescript
export const idpProviders = idem.table('idp_providers', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Provider identification
  providerKey: text('provider_key').notNull().unique(),
  // 'vipps', 'helseid', 'google', 'facebook', 'discord', 'github'

  providerName: text('provider_name').notNull(),
  providerType: text('provider_type').notNull(), // 'oidc', 'oauth2'

  // OIDC metadata
  issuer: text('issuer'),
  authorizationEndpoint: text('authorization_endpoint'),
  tokenEndpoint: text('token_endpoint'),
  userinfoEndpoint: text('userinfo_endpoint'),
  jwksUri: text('jwks_uri'),

  // Display
  displayName: text('display_name').notNull(),
  logoUrl: text('logo_url'),
  buttonColor: text('button_color'),

  // Configuration (nullable - not all providers are configured)
  clientId: text('client_id'),
  clientSecretEncrypted: text('client_secret_encrypted'),
  scopes: jsonb('scopes').$type<string[]>(),
  redirectUri: text('redirect_uri'),
  additionalParams: jsonb('additional_params').$type<Record<string, string>>(),

  // Health tracking
  consecutiveFailures: integer('consecutive_failures').notNull().default(0),
  lastFailureAt: timestamp('last_failure_at'),
  lastSuccessAt: timestamp('last_success_at'),

  // Status
  enabled: boolean('enabled').notNull().default(true),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Linking External Identities to Accounts

```typescript
export const identities = idem.table('identities', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Link to account
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),

  // Provider information
  provider: text('provider').notNull(), // 'vipps', 'helseid', 'google', etc.
  providerSubject: text('provider_subject').notNull(), // Unique ID from provider
  providerIssuer: text('provider_issuer'), // Issuer URL (for OIDC providers)

  // Identity metadata
  isPrimary: boolean('is_primary').notNull().default(false),

  // Verified status
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
});
```

## Consequences

### Positive
- **Simpler Schema**: No tenant-scoped bindings needed for single-tenant deployment
- **Consistent Pipeline**: Same broker flow across all providers
- **Direct Configuration**: Provider setup and credentials stored directly (nullable fields)
- **Health Monitoring**: Failure tracking enables operational alerts and provider status dashboard
- **Flexible Identity Linking**: One account can have multiple external identities (Vipps + Google + email)

### Negative
- **No Multi-Tenancy**: Cannot serve multiple organizations with different provider credentials
  - **Mitigation**: This is intentional - Idem is single-tenant by design (ADR 0001)
- **Configuration Overhead**: Unconfigured providers have NULL credential fields
  - **Mitigation**: Admin UI should hide or clearly indicate unconfigured providers
