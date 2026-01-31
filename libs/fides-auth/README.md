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

**Node.js only** - Functions for OAuth 2.0 / OpenID Connect flows with PKCE support.

Uses `openid-client` library. For browser environments, use `oauth-browser` instead.

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

### OAuth Browser (`@eventuras/fides-auth/oauth-browser`)

**Browser only** - OAuth 2.0 helpers using Web Crypto API (no Node.js dependencies).

Perfect for Vite SPAs, React applications, and any browser-only frontend.

#### Browser Flow Example

```typescript
import { generatePKCE, buildAuthorizationUrl, exchangeCodeForTokens }
  from '@eventuras/fides-auth/oauth-browser';

const config = {
  issuer: 'https://auth.example.com',
  clientId: 'my-client-id',
  redirect_uri: 'https://myapp.com/callback',
  scope: 'openid profile email',
};

// 1. Start OAuth flow
async function startLogin() {
  const pkce = await generatePKCE();

  // Store in sessionStorage
  sessionStorage.setItem('code_verifier', pkce.code_verifier);
  sessionStorage.setItem('state', pkce.state);

  // Redirect to authorization endpoint
  const authUrl = buildAuthorizationUrl(config, pkce);
  window.location.href = authUrl;
}

// 2. Handle callback
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  // Verify state matches
  if (state !== sessionStorage.getItem('state')) {
    throw new Error('State mismatch');
  }

  // Exchange code for tokens
  const verifier = sessionStorage.getItem('code_verifier')!;
  const tokens = await exchangeCodeForTokens(config, code, verifier);

  // Store tokens
  sessionStorage.setItem('access_token', tokens.access_token);
  sessionStorage.setItem('id_token', tokens.id_token);
}
```

**When to use which:**

- `oauth` - Use in Node.js, Next.js API routes, backend services
- `oauth-browser` - Use in Vite, React SPA, browser-only apps

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

