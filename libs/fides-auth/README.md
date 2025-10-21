# @eventuras/fides-auth

Framework-agnostic authentication library for OAuth 2.0 / OpenID Connect flows.

## Philosophy

This library is designed to be **modular and composable**. Each function can be used independently or as part of a complete authentication flow. This makes it easy to:

- Use only the functions you need
- Build custom authentication flows
- Test individual components
- Integrate with different frameworks

## Installation

```bash
pnpm add @eventuras/fides-auth
```

## Core Modules

### OAuth (`@eventuras/fides-auth/oauth`)

Functions for OAuth 2.0 / OpenID Connect flows with PKCE support.

#### Individual Functions

```typescript
import { 
  discoverOpenIdConfig,
  buildPKCEOptions,
  buildAuthorizationUrl,
  refreshAccesstoken 
} from '@eventuras/fides-auth/oauth';

// 1. Discover OAuth provider configuration
const config = await discoverOpenIdConfig(oauthConfig);

// 2. Generate PKCE parameters
const pkce = await buildPKCEOptions(oauthConfig);

// 3. Build authorization URL
const authUrl = await buildAuthorizationUrl(oauthConfig, pkce);

// 4. Refresh access token
const tokens = await refreshAccesstoken(oauthConfig, refreshToken);
```

#### Complete Flow Example

```typescript
import { buildPKCEOptions, buildAuthorizationUrl } from '@eventuras/fides-auth/oauth';

// Start login flow
async function startLoginFlow(oauthConfig: OAuthConfig) {
  // Generate PKCE parameters
  const pkce = await buildPKCEOptions(oauthConfig);
  
  // Build auth URL
  const authUrl = await buildAuthorizationUrl(oauthConfig, pkce);
  
  // Store PKCE values securely (e.g., encrypted cookies)
  // Then redirect to authUrl
  return { authUrl, pkce };
}
```

For detailed documentation on all modules, examples, and best practices, see the full documentation at [docs/README.md](./docs/README.md).

## Quick Start

```typescript
import { buildPKCEOptions, buildAuthorizationUrl } from '@eventuras/fides-auth/oauth';
import { validateSessionJwt } from '@eventuras/fides-auth/session-validation';
import { refreshSession } from '@eventuras/fides-auth/session-refresh';

const oauthConfig = {
  issuer: 'https://your-domain.auth0.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirect_uri: 'https://yourdomain.com/api/auth/callback',
  scope: 'openid profile email offline_access',
};

// Start OAuth login
const pkce = await buildPKCEOptions(oauthConfig);
const authUrl = await buildAuthorizationUrl(oauthConfig, pkce);

// Validate session
const { status, session } = await validateSessionJwt(encryptedJwt);

// Refresh session
const updated = await refreshSession(session, oauthConfig);
```

## Security

- ✅ Never logs sensitive information (tokens, emails, passwords)
- ✅ Uses PKCE for OAuth flows
- ✅ Encrypts session JWTs
- ✅ Validates all inputs

## Framework Integration

This library is framework-agnostic. For Next.js, use `@eventuras/fides-auth-next`.

## License

MIT

