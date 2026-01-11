# @eventuras/payload-vipps-auth

Vipps Login authentication plugin for Payload CMS. Enables seamless Vipps MobilePay login integration for your Payload applications.

## Features

- ✅ **Vipps Login (OIDC)** - OAuth 2.0 / OpenID Connect authentication
- ✅ **PKCE Support** - Secure authorization code flow
- ✅ **Payload Native Sessions** - Uses Payload's built-in session management
- ✅ **Custom User Mapping** - Map Vipps profile data to your Payload user fields
- ✅ **Auto User Creation** - Automatically create users on first Vipps login
- ✅ **Multi-Environment** - Works with Vipps test and production environments
- ✅ **TypeScript** - Full type safety

## Installation

```bash
pnpm add @eventuras/payload-vipps-auth
```

## Quick Start

### 1. Configure Environment Variables

Add to your `.env` file:

```bash
# Vipps OAuth credentials (from Vipps Developer Portal)
VIPPS_LOGIN_CLIENT_ID=your-client-id
VIPPS_LOGIN_CLIENT_SECRET=your-client-secret

# Optional: Override automatic redirect URI computation
# By default, uses: {request.origin}/api/auth/vipps/callback
# VIPPS_LOGIN_REDIRECT_URI=https://your-domain.com/api/auth/vipps/callback
```

### 2. Add Plugin to Payload Config

```typescript
// src/payload.config.ts
import { vippsAuthPlugin } from '@eventuras/payload-vipps-auth';
import { buildConfig } from 'payload';

export default buildConfig({
  // ... other config
  plugins: [
    vippsAuthPlugin({
      // Required configuration
      clientId: process.env.VIPPS_LOGIN_CLIENT_ID!,
      clientSecret: process.env.VIPPS_LOGIN_CLIENT_SECRET!,
      
      // Optional: Enable/disable plugin (default: true)
      // Useful for environment-specific configuration
      enabled: process.env.VIPPS_LOGIN_ENABLED !== 'false',
      
      // Optional: Vipps API environment (default: 'test')
      environment: process.env.VIPPS_LOGIN_ENVIRONMENT === 'production' ? 'production' : 'test',
      
      // Optional: Override redirect URI (default: computed from request)
      // redirectUri: process.env.VIPPS_LOGIN_REDIRECT_URI,
      
      // Optional: Disable email/password login
      disableLocalStrategy: false,
      
      // Optional: Custom user mapping
      mapVippsUser: (vippsUser) => ({
        email: vippsUser.email,
        email_verified: vippsUser.email_verified,
        given_name: vippsUser.given_name,
        family_name: vippsUser.family_name,
        phone_number: vippsUser.phone_number,
        phone_number_verified: vippsUser.phone_number_verified,
        // Map Vipps addresses to your user schema
        addresses: vippsUser.addresses?.map((addr) => ({
          label: 'Vipps',
          isDefault: false,
          street_address: addr.street_address,
          postal_code: addr.postal_code,
          region: addr.region,
          country: addr.country,
        })),
      }),
    }),
  ],
});
```

### 3. Create API Routes

Create the following API routes in your Next.js app:

**`src/app/api/auth/vipps/login/route.ts`:**
```typescript
import { handleVippsLogin, resolveConfig } from '@eventuras/payload-vipps-auth';

export async function GET(request: Request) {
  const config = resolveConfig({
    clientId: process.env.VIPPS_LOGIN_CLIENT_ID!,
    clientSecret: process.env.VIPPS_LOGIN_CLIENT_SECRET!,
    // redirectUri computed automatically from request
  });

  return handleVippsLogin(request, config);
}
```

**`src/app/api/auth/vipps/callback/route.ts`:**
```typescript
import { handleVippsCallback, resolveConfig } from '@eventuras/payload-vipps-auth';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: Request) {
  const pluginConfig = resolveConfig({
    clientId: process.env.VIPPS_CLIENT_ID,
    clientSecret: process.env.VIPPS_CLIENT_SECRET,
    // redirectUri computed automatically from request
  });

  const payload = await getPayload({ config });

  return handleVippsCallback(request, pluginConfig, payload);
}
```

### 4. Add Login Button (Optional)

Add a "Login with Vipps" button to your login page:

```tsx
// src/components/BeforeLogin/VippsLoginButton.tsx
'use client';

export const VippsLoginButton = () => {
  return (
    <button
      onClick={() => window.location.href = '/api/auth/vipps/login'}
      style={{
        backgroundColor: '#FF5B24',
        color: 'white',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Logg inn med Vipps
    </button>
  );
};
```

## Configuration Options

### Plugin Options

```typescript
interface VippsAuthPluginConfig {
  /** Vipps OAuth Client ID (required) */
  clientId: string;
  
  /** Vipps OAuth Client Secret (required) */
  clientSecret: string;
  
  /** OAuth redirect URI / callback URL (optional, computed from request if not provided) */
  redirectUri?: string;
  
  /** Vipps API environment (optional, default: 'test') */
  environment?: 'test' | 'production';
  
  /** OpenID Connect scopes (optional) */
  scope?: string;
  
  /** Vipps subscription key (optional) */
  subscriptionKey?: string;
  
  /** Merchant serial number (optional) */
  merchantSerialNumber?: string;
  
  /** Disable local (email/password) authentication (optional, default: false) */
  disableLocalStrategy?: boolean;
  
  /** Whether the plugin is enabled (optional, default: true) */
  enabled?: boolean;
  
  /** Custom mapping function from Vipps to Payload user (optional) */
  mapVippsUser?: (vippsUser: VippsUserInfo) => Partial<any>;
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VIPPS_LOGIN_CLIENT_ID` | ✅ | - | Vipps OAuth Client ID |
| `VIPPS_LOGIN_CLIENT_SECRET` | ✅ | - | Vipps OAuth Client Secret |
| `VIPPS_LOGIN_REDIRECT_URI` | ✅ | - | OAuth callback URL |
| `VIPPS_API_URL` | ❌ | `https://apitest.vipps.no` | Vipps API environment |

## User Matching & Creation

The plugin matches users by **email address**. When a user logs in with Vipps:

1. **Existing User**: If a user with the same email exists, they are logged in using Payload's native session
2. **New User**: If no user exists, a new user is created with Vipps profile data
3. **Role Assignment**: New users get the default role from your User collection (`roles: ['user']`)
4. **Session Management**: Payload handles all session cookies and authentication state

⚠️ **Important**: If a user changes their email in Vipps, they will be treated as a new user.

## Custom User Mapping

Customize how Vipps profile data maps to your Payload user fields:

```typescript
vippsAuthPlugin({
  mapVippsUser: (vippsUser) => {
    return {
      // Standard fields
      email: vippsUser.email,
      given_name: vippsUser.given_name,
      family_name: vippsUser.family_name,
      phone_number: vippsUser.phone_number,
      
      // Custom logic
      roles: vippsUser.email?.endsWith('@losol.io') 
        ? ['admin'] 
        : ['user'],
      
      // Map addresses
      addresses: vippsUser.addresses?.map((addr) => ({
        label: 'Vipps',
        isDefault: true,
        street_address: addr.street_address,
        postal_code: addr.postal_code,
        region: addr.region,
        country: addr.country,
      })),
    };
  },
})
```

## Vipps User Info Schema

```typescript
interface VippsUserInfo {
  sub: string;                    // Unique Vipps user ID (UUID)
  email?: string;                 // Email address
  email_verified?: boolean;       // Email verification status
  given_name?: string;            // First name
  family_name?: string;           // Last name
  name?: string;                  // Full name
  phone_number?: string;          // Phone (e.g., '4712345678')
  phone_number_verified?: boolean;
  birthdate?: string;             // ISO 8601 (e.g., '1990-01-15')
  addresses?: VippsAddress[];     // Physical addresses
}
```

## Security

### Session Management

- Sessions are stored in **encrypted HTTP-only cookies**
- Uses `@eventuras/fides-auth` for secure session handling
- Supports **refresh tokens** for long-lived sessions
- Automatic token refresh before expiration

### PKCE Flow

The plugin implements **PKCE (Proof Key for Code Exchange)** for enhanced security:

1. Generate random `code_verifier` and `code_challenge`
2. Store verifier server-side (in-memory with TTL)
3. Send challenge to Vipps in authorization request
4. Exchange code with verifier for tokens

### Production Checklist

- [ ] Set `VIPPS_API_URL=https://api.vipps.no` (production environment)
- [ ] Generate secure `VIPPS_SESSION_SECRET` (32+ random bytes)
- [ ] Use HTTPS for `VIPPS_LOGIN_REDIRECT_URI`
- [ ] Configure proper CORS in Payload config
- [ ] Consider setting `HISTORIA_AUTH_DISABLE_LOCAL_STRATEGY=true` for Vipps-only auth
- [ ] Store PKCE state in Redis/database for multi-instance deployments

## Troubleshooting

### "Invalid state" error

- PKCE state expired (10 min TTL)
- User took too long to complete authorization
- **Solution**: Retry login

### "No email" error

- User's Vipps account has no verified email
- Email scope not requested
- **Solution**: Ensure `email` scope is included

### Session not persisting

- Cookie not being set (check browser dev tools)
- HTTPS required in production
- **Solution**: Use HTTPS or localhost for testing

### User created but can't login

- Session cookie encryption secret changed
- **Solution**: Use consistent `VIPPS_SESSION_SECRET`

## Architecture

```
┌─────────────────┐
│   User clicks   │
│ "Login with     │
│     Vipps"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  GET /api/auth/vipps/   │
│       login             │
│  - Generate PKCE        │
│  - Store code_verifier  │
│  - Build auth URL       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Redirect to Vipps     │
│   Authorization         │
│   - User authenticates  │
│   - User consents       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ GET /api/auth/vipps/    │
│      callback           │
│  - Exchange code        │
│  - Get user info        │
│  - Find/create user     │
│  - Set session cookie   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Redirect to /admin    │
│   User logged in!       │
└─────────────────────────┘
```

## Future: ID Broker Compatibility

This plugin is designed to be compatible with a future ID broker (like `apps/idem-idp`):

- Modular OAuth configuration (easy to point to different issuer)
- Standard OIDC flow (works with any OIDC provider)
- Pluggable user mapping (can adapt to broker's user schema)

To switch to ID broker:
1. Update `apiUrl` to broker URL
2. Update `clientId` and `clientSecret` to broker credentials
3. Adjust `mapVippsUser` if broker returns different claims

## License

MIT

## Links

- [Vipps Login API Documentation](https://developer.vippsmobilepay.com/docs/APIs/login-api/)
- [Payload CMS Custom Strategies](https://payloadcms.com/docs/authentication/custom-strategies)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
