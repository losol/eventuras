# @eventuras/fides-auth

Framework-agnostic OAuth 2.0 / OpenID Connect library with PKCE, encrypted sessions, rate limiting, and pluggable logging.

## Features

- **OAuth 2.0 + OIDC** — Authorization Code with PKCE, token refresh, client credentials
- **Dual environment** — Node.js (`openid-client`) and browser (Web Crypto) entry points
- **Encrypted sessions** — AES-256-GCM encrypted JWTs for secure session storage
- **Rate limiting** — Generic token-bucket algorithm, ready for login protection
- **Silent login** — Detect `prompt=none` results without user interaction
- **Pluggable logging** — Bring your own logger (pino, winston, etc.) or use the built-in console logger
- **Tree-shakeable** — Each module is a separate entry point; import only what you need
- **TypeScript-first** — Full type safety with exported interfaces
- **Identity providers** — Includes a Vipps Login provider; designed to support additional providers

## Installation

```bash
npm install @eventuras/fides-auth
# or
pnpm add @eventuras/fides-auth
# or
yarn add @eventuras/fides-auth
```

**Requirements:** Node.js ≥ 18 (uses Web Crypto API)

## Quick Start

### Node.js — OAuth with PKCE

```typescript
import {
  buildPKCEOptions,
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
} from "@eventuras/fides-auth/oauth";
import { validateSessionJwt, createEncryptedJWT } from "@eventuras/fides-auth";

const oauthConfig = {
  issuer: "https://auth.example.com",
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  redirect_uri: "https://app.example.com/callback",
  scope: "openid profile email offline_access",
};

// 1. Start login — redirect user to auth URL
const pkce = await buildPKCEOptions(oauthConfig);
const authUrl = await buildAuthorizationUrl(oauthConfig, pkce);

// 2. Handle callback — exchange code for tokens
const tokens = await exchangeAuthorizationCode(
  oauthConfig,
  callbackUrl,
  pkce.code_verifier,
  pkce.state,
);

// 3. Create encrypted session
const secret = "0123456789abcdef..."; // 64 hex chars (32 bytes)
const jwt = await createEncryptedJWT({ user, tokens }, secret);

// 4. Validate session later
const { status, session } = await validateSessionJwt(jwt, secret);
```

### Browser — OAuth SPA Flow

```typescript
import {
  generatePKCE,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
} from "@eventuras/fides-auth/oauth-browser";

const config = {
  issuer: "https://auth.example.com",
  clientId: "my-client-id",
  redirect_uri: "https://myapp.com/callback",
  scope: "openid profile email",
};

// Start flow
const pkce = await generatePKCE();
sessionStorage.setItem("code_verifier", pkce.code_verifier);
sessionStorage.setItem("state", pkce.state);
window.location.href = buildAuthorizationUrl(config, pkce);

// Handle callback
const code = new URLSearchParams(location.search).get("code");
const tokens = await exchangeCodeForTokens(
  config,
  code,
  sessionStorage.getItem("code_verifier")!,
);
```

## Modules

Each module is available as a separate entry point for tree-shaking:

| Entry Point                                | Environment | Description                                           |
| ------------------------------------------ | ----------- | ----------------------------------------------------- |
| `@eventuras/fides-auth`                    | Node.js     | Main entry — re-exports utils, session, types, logger |
| `@eventuras/fides-auth/oauth`              | Node.js     | OAuth/OIDC flows with `openid-client`                 |
| `@eventuras/fides-auth/oauth-browser`      | Browser     | OAuth/OIDC flows with Web Crypto API                  |
| `@eventuras/fides-auth/session-validation` | Node.js     | Encrypted JWT session validation                      |
| `@eventuras/fides-auth/session-refresh`    | Node.js     | Automatic token refresh for sessions                  |
| `@eventuras/fides-auth/silent-login`       | Node.js     | Silent login (`prompt=none`) utilities                |
| `@eventuras/fides-auth/utils`              | Universal   | Crypto helpers, hashing, token generation             |
| `@eventuras/fides-auth/rate-limit`         | Universal   | Token-bucket rate limiter                             |
| `@eventuras/fides-auth/logger`             | Universal   | Pluggable logger interface and configuration          |
| `@eventuras/fides-auth/types`              | Universal   | TypeScript types (Session, Tokens, etc.)              |
| `@eventuras/fides-auth/providers/vipps`    | Node.js     | Vipps Login identity provider                         |

### OAuth — Node.js (`/oauth`)

Full OIDC flows using `openid-client`:

```typescript
import {
  buildPKCEOptions,
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  refreshAccessToken,
  extractUserFromTokens,
  buildSessionFromTokens,
  validateReturnUrl,
  buildOidcLogoutUrl,
  clientCredentialsGrant,
} from "@eventuras/fides-auth/oauth";
```

### OAuth — Browser (`/oauth-browser`)

Lightweight browser-only flows using Web Crypto:

```typescript
import {
  generatePKCE,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
} from "@eventuras/fides-auth/oauth-browser";
```

### Session Management

```typescript
import { createEncryptedJWT, validateSessionJwt } from "@eventuras/fides-auth";
import { refreshSession } from "@eventuras/fides-auth/session-refresh";

// Secrets accept hex strings or Uint8Array
const secret = process.env.SESSION_SECRET!; // 64 hex chars = 32 bytes

// Create session JWT (AES-256-GCM encrypted)
const jwt = await createEncryptedJWT(sessionData, secret);

// Validate and decrypt
const { status, session } = await validateSessionJwt(jwt, secret);
if (status === "VALID") {
  // session is typed as Session
}

// Refresh expired tokens
const refreshed = await refreshSession(session, oauthConfig);
```

### Crypto Utilities (`/utils`)

Standalone cryptographic helpers using Web Crypto API:

```typescript
import {
  encrypt,
  decrypt,
  sha256,
  sha512,
  generateToken,
  toHex,
  hexToUint8Array,
} from "@eventuras/fides-auth/utils";

// AES-256-GCM encryption
const secret = "0123456789abcdef".repeat(4); // 64 hex chars
const encrypted = await encrypt("sensitive data", secret);
const decrypted = await decrypt(encrypted, secret);

// Hashing
const hash = await sha256("hello world");

// Random token generation
const token = generateToken(32); // 64 hex char token

// Hex conversions
const bytes = hexToUint8Array("deadbeef");
const hex = toHex(new Uint8Array([0xde, 0xad]));
```

### Rate Limiting (`/rate-limit`)

Generic token-bucket rate limiter:

```typescript
import { TokenBucket } from "@eventuras/fides-auth/rate-limit";

// 5 attempts per 60 seconds per IP
const loginLimiter = new TokenBucket<string>(5, 60);

function handleLogin(ip: string) {
  if (!loginLimiter.consume(ip, 1)) {
    throw new Error("Too many login attempts");
  }
  // proceed with login
}
```

### Silent Login (`/silent-login`)

Detect whether a user has an active session without showing UI:

```typescript
import {
  buildSilentLoginUrl,
  checkSilentLoginResult,
  requiresInteractiveLogin,
  SilentLoginErrors,
} from "@eventuras/fides-auth/silent-login";
```

### Pluggable Logging (`/logger`)

The library uses console logging by default. Plug in your preferred logger at startup:

```typescript
import { configureLogger } from "@eventuras/fides-auth/logger";

// Example: plug in pino
import pino from "pino";
const pinoInstance = pino();

configureLogger({
  create({ namespace, context }) {
    return pinoInstance.child({ namespace, ...context });
  },
});
```

Any object implementing `{ debug, info, warn, error }` works — pino, winston, bunyan, or your own.

### Vipps Login Provider (`/providers/vipps`)

```typescript
import {
  VippsLoginClient,
  VippsEnvironments,
  VippsLoginScopes,
} from "@eventuras/fides-auth/providers/vipps";

const client = new VippsLoginClient({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  redirectUri: "https://app.example.com/callback",
  subscriptionKey: "your-subscription-key",
  issuer: VippsEnvironments.Production,
  scope: [
    VippsLoginScopes.OpenId,
    VippsLoginScopes.Email,
    VippsLoginScopes.Name,
  ].join(" "),
});

const pkce = await client.buildPKCEOptions();
const authUrl = await client.buildAuthorizationUrl(pkce);
// redirect user → callback → exchange code → getUserInfo
```

## Security

- **PKCE** — All OAuth flows use Proof Key for Code Exchange
- **AES-256-GCM** — Sessions encrypted with authenticated encryption
- **Open redirect protection** — `validateReturnUrl` prevents redirect attacks
- **No secret logging** — Tokens, keys, and PII are never logged
- **Web Crypto API** — Uses the platform cryptographic primitives (not userland crypto)

## TypeScript

All types are exported from `@eventuras/fides-auth/types`:

```typescript
import type {
  Session,
  Tokens,
  CreateSessionOptions,
} from "@eventuras/fides-auth/types";
import type {
  OAuthConfig,
  OidcUserInfo,
  PKCEOptions,
} from "@eventuras/fides-auth/oauth";
import type {
  FidesLogger,
  FidesLoggerFactory,
  FidesLoggerOptions,
} from "@eventuras/fides-auth/logger";
```

## License

[MIT](./LICENSE)
