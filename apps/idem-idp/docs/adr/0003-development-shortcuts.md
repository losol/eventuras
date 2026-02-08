# ADR 0003 — Development Shortcuts and Testing Utilities

## Status
Accepted

## Context

With 10 applications depending on Idem for authentication, developers need efficient ways to test their applications locally without the overhead of:
- Setting up Vipps test accounts (requires mobile app, costs money)
- Configuring HelseID test environments (complex setup)
- Going through full OAuth/OIDC flows for every test (slow)
- Managing test user credentials across multiple developers

During local development, the focus should be on building features quickly, not fighting with authentication infrastructure. However, these shortcuts must NEVER reach staging or production environments.

### Authentication Methods Supported by Idem

**Production Authentication:**
- **IdP Brokering**: Vipps, HelseID (Norwegian identity verification)
- **Social Login**: Facebook, Google, Discord, GitHub (federated authentication)
- **OTP Authentication**: One-time passwords via SMS/Email (passwordless)

**NOT Supported:**
- ❌ Username/password authentication (security risk, password management overhead)
- ❌ Magic links (use OTP instead for passwordless authentication)

## Decision

### 1. Mock Identity Providers

**Mock Vipps Provider (Development Only):**
```typescript
// idp/providers/mock-vipps.ts
export const mockVippsProvider = {
  key: 'mock_vipps',
  display_name: 'Vipps (Mock - Dev Only)',
  type: 'mock',
  enabled: process.env.NODE_ENV === 'development',

  // Simulates Vipps OAuth flow without external service
  async authorize(req, res) {
    // Show simple form: "Login as [name] [phone]"
    // No actual Vipps redirect
  },

  async callback(req, res) {
    // Generate fake ID token with Vipps-like claims
    return {
      sub: `mock_vipps_${Date.now()}`,
      name: req.body.name || 'Test User',
      phone_number: req.body.phone || '+4712345678',
      phone_number_verified: true,
      email: req.body.email || 'test@example.com',
      email_verified: true,
    };
  },
};
```

**Mock HelseID Provider (Development Only):**
```typescript
// idp/providers/mock-helseid.ts
export const mockHelseIDProvider = {
  key: 'mock_helseid',
  display_name: 'HelseID (Mock - Dev Only)',
  type: 'mock',
  enabled: process.env.NODE_ENV === 'development',

  async callback(req, res) {
    return {
      sub: `mock_helseid_${Date.now()}`,
      'helseid://claims/identity/pid': '12345678901', // Fake national ID
      'helseid://claims/identity/security_level': '4',
      name: req.body.name || 'Dr. Test',
      email: req.body.email || 'doctor@test.no',
    };
  },
};
```

**Mock Social Login Providers (Development Only):**
```typescript
// idp/providers/mock-social.ts

// Mock Facebook
export const mockFacebookProvider = {
  key: 'mock_facebook',
  display_name: 'Facebook (Mock - Dev Only)',
  type: 'mock',
  enabled: process.env.NODE_ENV === 'development',

  async callback(req, res) {
    return {
      sub: `mock_facebook_${Date.now()}`,
      name: req.body.name || 'Test User',
      email: req.body.email || 'test@facebook.com',
      email_verified: true,
      picture: 'https://via.placeholder.com/150',
    };
  },
};

// Mock Google
export const mockGoogleProvider = {
  key: 'mock_google',
  display_name: 'Google (Mock - Dev Only)',
  type: 'mock',
  enabled: process.env.NODE_ENV === 'development',

  async callback(req, res) {
    return {
      sub: `mock_google_${Date.now()}`,
      name: req.body.name || 'Test User',
      email: req.body.email || 'test@gmail.com',
      email_verified: true,
      picture: 'https://via.placeholder.com/150',
    };
  },
};

// Mock Discord
export const mockDiscordProvider = {
  key: 'mock_discord',
  display_name: 'Discord (Mock - Dev Only)',
  type: 'mock',
  enabled: process.env.NODE_ENV === 'development',

  async callback(req, res) {
    return {
      sub: `mock_discord_${Date.now()}`,
      username: req.body.username || 'testuser#1234',
      email: req.body.email || 'test@discord.com',
      verified: true,
      avatar: 'https://via.placeholder.com/150',
    };
  },
};

// Mock GitHub
export const mockGitHubProvider = {
  key: 'mock_github',
  display_name: 'GitHub (Mock - Dev Only)',
  type: 'mock',
  enabled: process.env.NODE_ENV === 'development',

  async callback(req, res) {
    return {
      sub: `mock_github_${Date.now()}`,
      login: req.body.login || 'testuser',
      name: req.body.name || 'Test User',
      email: req.body.email || 'test@github.com',
      email_verified: true,
      avatar_url: 'https://via.placeholder.com/150',
    };
  },
};
```

### 2. Direct Token Issuance (DEV ONLY)

**Endpoint: POST /dev/token/issue**

Bypasses entire login flow and issues tokens directly.

```typescript
// routes/dev/token-issue.ts
import { requireDevelopment } from '../../middleware/dev-only';

router.post('/dev/token/issue', requireDevelopment, async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    scopes: z.array(z.string()).default(['openid', 'profile', 'email']),
    client_id: z.string().optional(),
    expires_in: z.number().min(60).max(86400).default(3600), // 1 hour default
  });

  const data = schema.parse(req.body);

  // 1. Find or create account
  let account = await db.query.accounts.findFirst({
    where: eq(accounts.primary_email, data.email),
  });

  if (!account) {
    account = await db.insert(accounts).values({
      primary_email: data.email,
      display_name: data.name || data.email.split('@')[0],
      active: true,
    }).returning().then(r => r[0]);

    // Create mock identity
    await db.insert(identities).values({
      account_id: account.id,
      provider: 'dev_mock',
      provider_subject: account.id,
      provider_issuer: 'http://localhost:3200',
      is_primary: true,
    });
  }

  // 2. Create access token directly (bypass OIDC provider)
  const token = await createAccessToken({
    sub: account.id,
    email: data.email,
    name: account.display_name,
    scope: data.scopes.join(' '),
    client_id: data.client_id || 'dev_client',
    expires_in: data.expires_in,
  });

  // 3. Store in oidc_store (for token introspection)
  await db.insert(oidcStore).values({
    name: 'AccessToken',
    id: token.jti,
    account_id: account.id,
    client_id: data.client_id || 'dev_client',
    scope: data.scopes.join(' '),
    expires_at: new Date(Date.now() + data.expires_in * 1000),
    payload: { token },
  });

  res.json({
    access_token: token.jwt,
    token_type: 'Bearer',
    expires_in: data.expires_in,
    scope: data.scopes.join(' '),
    account_id: account.id,
  });
});
```

**Usage:**
```bash
# Issue token for local testing
curl -X POST http://localhost:3200/dev/token/issue \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@eventuras.com",
    "name": "Test Developer",
    "scopes": ["openid", "profile", "email", "offline_access"]
  }'

# Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid profile email",
  "account_id": "uuid-here"
}

# Use in your app
export TOKEN=$(curl -s ... | jq -r .access_token)
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Auto-Login via Query Parameter (DEV ONLY)

**Enhanced /authorize endpoint with ?dev_login_as=email**

Instead of a separate dev endpoint, enhance the normal OAuth `/authorize` flow with a dev-only query parameter. This ensures the dev shortcut goes through the real OIDC flow.

```typescript
// In OIDC provider interaction handling
// This runs during the /authorize flow, before showing login UI

async function handleInteraction(ctx, interaction) {
  const { prompt } = interaction;

  // DEV ONLY: Auto-login if dev_login_as parameter present
  if (process.env.NODE_ENV === 'development' && ctx.query.dev_login_as) {
    const email = ctx.query.dev_login_as;

    // Find or create account
    let account = await findOrCreateAccount(email);

    // Complete the interaction with this account
    await interaction.finished(ctx, {
      login: {
        accountId: account.id,
        ts: Math.floor(Date.now() / 1000),
        amr: ['dev_auto'],
        remember: false,
      },
    }, { mergeWithLastSubmission: false });

    // OIDC provider handles the rest (consent, token issuance, redirect)
    return;
  }

  // Normal flow: show login UI
  if (prompt.name === 'login') {
    return ctx.render('login', { /* ... */ });
  }
}
```

**Usage:**
```bash
# Normal OAuth flow, but with auto-login
# App initiates OAuth flow as usual:
http://localhost:3200/authorize
  ?response_type=code
  &client_id=my_app
  &redirect_uri=http://localhost:3000/callback
  &scope=openid profile email
  &dev_login_as=test@eventuras.com  # DEV ONLY parameter

# The flow completes automatically:
# 1. Creates/finds account for test@eventuras.com
# 2. Completes OIDC interaction
# 3. Issues authorization code
# 4. Redirects to http://localhost:3000/callback?code=xxx
# 5. App exchanges code for tokens (normal flow)
```

**Integration Test Example:**
```typescript
// In your app's test suite
it('should authenticate user via OAuth', async () => {
  // Start OAuth flow with dev_login_as parameter
  const authorizeUrl = new URL('http://localhost:3200/authorize');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', 'test_client');
  authorizeUrl.searchParams.set('redirect_uri', 'http://localhost:3000/callback');
  authorizeUrl.searchParams.set('scope', 'openid profile email');
  authorizeUrl.searchParams.set('dev_login_as', 'test@eventuras.com'); // Auto-login

  const response = await fetch(authorizeUrl, { redirect: 'manual' });

  // Should redirect to callback with auth code
  expect(response.status).toBe(302);
  const location = response.headers.get('location');
  expect(location).toContain('/callback?code=');

  // Exchange code for tokens (normal flow)
  const code = new URL(location).searchParams.get('code');
  const tokenResponse = await fetch('http://localhost:3200/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/callback',
      client_id: 'test_client',
    }),
  });

  const tokens = await tokenResponse.json();
  expect(tokens.access_token).toBeDefined();
});
```

### 4. Token Introspection UI (DEV ONLY)

**Endpoint: GET /dev/tokens**

Web UI to view and manage all active tokens.

```typescript
// routes/dev/token-ui.ts
router.get('/dev/tokens', requireDevelopment, async (req, res) => {
  const tokens = await db.query.oidcStore.findMany({
    where: and(
      isNull(oidcStore.consumed_at),
      gt(oidcStore.expires_at, new Date())
    ),
    orderBy: [desc(oidcStore.created_at)],
    limit: 100,
  });

  // Render HTML table with token details
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dev Tokens - Idem</title>
      <style>
        body { font-family: monospace; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .revoke { color: red; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>🔧 Dev Tokens</h1>
      <p>Active tokens: ${tokens.length}</p>
      <table>
        <tr>
          <th>Type</th>
          <th>Account</th>
          <th>Client</th>
          <th>Scope</th>
          <th>Expires</th>
          <th>Actions</th>
        </tr>
        ${tokens.map(t => `
          <tr>
            <td>${t.name}</td>
            <td>${t.account_id?.slice(0, 8)}...</td>
            <td>${t.client_id}</td>
            <td>${t.scope}</td>
            <td>${new Date(t.expires_at).toLocaleString()}</td>
            <td>
              <a href="/dev/tokens/revoke/${t.id}" class="revoke">Revoke</a>
            </td>
          </tr>
        `).join('')}
      </table>
      <br>
      <a href="/dev/tokens/revoke-all">Revoke All Tokens</a>
    </body>
    </html>
  `);
});

router.get('/dev/tokens/revoke/:id', requireDevelopment, async (req, res) => {
  await db.update(oidcStore)
    .set({ consumed_at: new Date() })
    .where(eq(oidcStore.id, req.params.id));

  res.redirect('/dev/tokens');
});

router.get('/dev/tokens/revoke-all', requireDevelopment, async (req, res) => {
  await db.update(oidcStore)
    .set({ consumed_at: new Date() })
    .where(isNull(oidcStore.consumed_at));

  res.redirect('/dev/tokens');
});
```

### 5. Account Seeding (DEV ONLY)

**Script: pnpm dev:seed**

Seeds database with test accounts for development.

```typescript
// scripts/dev-seed.ts
import { db } from '@idem/db';
import { accounts, identities, oauthClients } from '@idem/db/schema';

const testAccounts = [
  {
    email: 'admin@eventuras.com',
    name: 'Admin User',
    roles: ['system_admin'],
  },
  {
    email: 'developer@eventuras.com',
    name: 'Developer User',
    roles: [],
  },
  {
    email: 'test@eventuras.com',
    name: 'Test User',
    roles: [],
  },
];

const testClients = [
  {
    client_id: 'dev_web_app',
    client_name: 'Development Web App',
    redirect_uris: ['http://localhost:3000/callback'],
    grant_types: ['authorization_code', 'refresh_token'],
  },
  {
    client_id: 'dev_mobile_app',
    client_name: 'Development Mobile App',
    redirect_uris: ['myapp://callback'],
    grant_types: ['authorization_code', 'refresh_token'],
  },
];

async function seed() {
  console.log('🌱 Seeding development database...');

  // Create test accounts
  for (const acc of testAccounts) {
    const account = await db.insert(accounts).values({
      primary_email: acc.email,
      display_name: acc.name,
      active: true,
    }).returning().then(r => r[0]);

    // Create mock identity
    await db.insert(identities).values({
      account_id: account.id,
      provider: 'dev_seed',
      provider_subject: account.id,
      is_primary: true,
    });

    console.log(`✓ Created account: ${acc.email}`);
  }

  // Create test OAuth clients
  for (const client of testClients) {
    const salt = randomBytes(32);
    const derivedKey = await scryptAsync('dev_secret', salt, 64, { N: 16384, r: 8, p: 1 });
    const hashedSecret = `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
    
    await db.insert(oauthClients).values({
      ...client,
      client_secret: hashedSecret,
    });

    console.log(`✓ Created client: ${client.client_id}`);
  }

  console.log('✅ Seeding complete!');
}

seed().catch(console.error);
```

### 6. Environment Guards (CRITICAL)

**Startup Validation:**
```typescript
// server/startup.ts
export function validateDevFeatures() {
  const env = process.env.NODE_ENV;

  // CRITICAL: Fail fast if dev shortcuts enabled in non-dev
  if (env !== 'development') {
    if (process.env.ENABLE_DEV_SHORTCUTS === 'true') {
      console.error('FATAL: ENABLE_DEV_SHORTCUTS=true in non-development environment');
      console.error(`NODE_ENV=${env}`);
      process.exit(1);
    }

    // Verify mock IdPs not registered
    const providers = getRegisteredIdPProviders();
    const mockProviders = providers.filter(p => p.key.startsWith('mock_'));

    if (mockProviders.length > 0) {
      console.error('FATAL: Mock IdP providers registered in non-development environment');
      console.error('Mock providers:', mockProviders.map(p => p.key));
      process.exit(1);
    }
  }

  // Log dev features status
  logger.info({
    nodeEnv: env,
    devShortcutsEnabled: process.env.NODE_ENV === 'development',
    mockIdPsAvailable: process.env.NODE_ENV === 'development',
  }, 'Dev features validation passed');
}

// Call before server starts
validateDevFeatures();
```

**Route Guards:**
```typescript
// middleware/dev-only.ts
export function requireDevelopment(req, res, next) {
  if (process.env.NODE_ENV !== 'development') {
    // Return 404, don't leak route existence
    return res.status(404).end();
  }
  next();
}

// Apply to all dev routes
app.use('/dev', requireDevelopment, devRouter);
```

**Build-time Validation:**
```typescript
// build-time check (tsup.config.ts or similar)
if (process.env.NODE_ENV === 'production') {
  // Ensure dev code is tree-shaken out
  const devImports = findDevImports(sourceFiles);
  if (devImports.length > 0) {
    throw new Error(`Dev-only imports found in production build: ${devImports}`);
  }
}
```

### 7. Visual Indicators

**Development Environment Banner:**
```html
<!-- All pages in dev show red banner -->
<div style="
  background: #ff0000;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
">
  ⚠️ DEVELOPMENT ENVIRONMENT - Dev shortcuts enabled
</div>
```

**Browser Tab:**
```html
<title>[DEV] Idem - Identity Provider</title>
<link rel="icon" href="/favicon-dev.ico"> <!-- Red favicon -->
```

## Consequences

### Positive
- **Fast Development**: Developers can test without external IdP dependencies
- **Offline Development**: No internet required for local testing
- **Easy Onboarding**: New developers can start immediately
- **Test Automation**: Simplified integration tests with direct token issuance
- **Debugging**: Token UI makes troubleshooting easier

### Negative
- **Security Risk if Leaked**: Catastrophic if dev shortcuts reach production
- **Behavioral Differences**: Mock IdPs may not match real IdP behavior exactly
- **False Confidence**: Tests pass locally but fail with real IdPs
- **Maintenance**: Mock IdPs need updates when real IdPs change

### Risks and Mitigations

**Risk: Dev shortcuts accidentally enabled in production**
- **Mitigation**: Triple-layered guards (startup validation, route guards, build-time checks)
- **Mitigation**: Integration tests verify production builds reject dev routes (return 404)
- **Mitigation**: CI/CD pipeline validates NODE_ENV before deployment

**Risk: Developers rely on mock IdPs, miss real IdP issues**
- **Mitigation**: Staging environment uses real IdP test environments (Vipps test, HelseID test)
- **Mitigation**: Require staging testing before production deployment
- **Mitigation**: Document differences between mock and real IdPs

**Risk: Mock IdP behavior diverges from real IdPs**
- **Mitigation**: Update mock IdPs when real IdPs change (quarterly review)
- **Mitigation**: Document known differences in mock provider code
- **Mitigation**: Staging tests catch mismatches

**Risk: Direct token issuance creates tokens with invalid structure**
- **Mitigation**: Use same token creation logic as real OIDC flow
- **Mitigation**: Validate token structure in tests
- **Mitigation**: Token UI shows token structure for debugging

## Testing Strategy

### Automated Tests
```typescript
describe('Dev Shortcuts', () => {
  it('should reject /dev routes in production', async () => {
    process.env.NODE_ENV = 'production';

    const res = await request(app).get('/dev/tokens');
    expect(res.status).toBe(404);
  });

  it('should fail startup if ENABLE_DEV_SHORTCUTS in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEV_SHORTCUTS = 'true';

    expect(() => validateDevFeatures()).toThrow('FATAL');
  });

  it('should issue valid tokens via /dev/token/issue', async () => {
    process.env.NODE_ENV = 'development';

    const res = await request(app)
      .post('/dev/token/issue')
      .send({ email: 'test@eventuras.com' });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();

    // Verify token works for authentication
    const profileRes = await request(app)
      .get('/userinfo')
      .set('Authorization', `Bearer ${res.body.access_token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe('test@eventuras.com');
  });

  it('should auto-login via dev_login_as parameter in development', async () => {
    process.env.NODE_ENV = 'development';

    // Start OAuth flow with dev_login_as parameter
    const res = await request(app)
      .get('/authorize')
      .query({
        response_type: 'code',
        client_id: 'test_client',
        redirect_uri: 'http://localhost:3000/callback',
        scope: 'openid profile email',
        dev_login_as: 'auto@eventuras.com',
      })
      .redirects(0);

    // Should redirect to callback with auth code (login was automatic)
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/callback');
    expect(res.headers.location).toContain('code=');

    // Verify account was created
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.primary_email, 'auto@eventuras.com'),
    });

    expect(account).toBeDefined();
  });

  it('should ignore dev_login_as parameter in production', async () => {
    process.env.NODE_ENV = 'production';

    // Start OAuth flow with dev_login_as parameter
    const res = await request(app)
      .get('/authorize')
      .query({
        response_type: 'code',
        client_id: 'test_client',
        redirect_uri: 'http://localhost:3000/callback',
        scope: 'openid profile email',
        dev_login_as: 'should-not-work@eventuras.com',
      })
      .redirects(0);

    // Should show login UI, NOT auto-login
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login'); // Shows login form

    // Verify account was NOT created
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.primary_email, 'should-not-work@eventuras.com'),
    });

    expect(account).toBeUndefined();
  });
});
```

### Manual Verification
Before each deployment:
- [ ] Verify `/dev` routes return 404 in staging build
- [ ] Verify mock IdPs not available in staging
- [ ] Test direct token issuance in dev
- [ ] Test auto-login via `?dev_login_as=email` parameter in dev
- [ ] Verify `dev_login_as` parameter ignored in staging/prod
- [ ] Verify token UI shows active tokens
- [ ] Test seed script creates accounts correctly
- [ ] Verify startup fails if dev features enabled in prod build

### Integration Test (CI/CD)
```bash
# Build for production
NODE_ENV=production pnpm build

# Start server
NODE_ENV=production pnpm start &

# Verify dev routes return 404
curl -f http://localhost:3200/dev/tokens && exit 1 || echo "OK: 404"

# Verify startup fails with dev shortcuts
ENABLE_DEV_SHORTCUTS=true NODE_ENV=production pnpm start 2>&1 | grep "FATAL" || exit 1
```

## Implementation Timeline

**Phase 2 (API Skeleton):**
- Environment guards (startup validation)
- Dev-only middleware

**Phase 7 (Developer Tooling):**
- Mock Vipps provider
- Mock HelseID provider
- Direct token issuance endpoint
- Auto-login via `dev_login_as` query parameter
- Token introspection UI
- Account seeding script
- Build-time validation

**Phase 8 (Hardening):**
- Integration tests for dev guards
- CI/CD validation
- Documentation for app developers

## Documentation for App Developers

**README for Eventuras App Teams:**

```markdown
# Using Idem in Development

## Quick Start (Local Development)

### Option 1: Auto-Login Parameter (Recommended - Full Flow)
Add `dev_login_as` parameter to your OAuth flow. This goes through the complete OIDC flow but skips the login UI.

```typescript
// In your app's OAuth initialization
const authUrl = new URL('http://localhost:3200/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', 'my_app');
authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/callback');
authUrl.searchParams.set('scope', 'openid profile email');

// DEV ONLY: Auto-login as specific user
if (process.env.NODE_ENV === 'development') {
  authUrl.searchParams.set('dev_login_as', 'test@eventuras.com');
}

// Redirect user to auth URL
window.location.href = authUrl.toString();

// User is automatically logged in, redirected back with auth code
// Your callback handler receives the code and exchanges it for tokens (normal flow)
```

**Benefits:**
- Tests the real OAuth/OIDC flow
- Code works in staging/prod (dev_login_as is ignored)
- Proper token exchange, refresh tokens, etc.
- No need to mock authentication in your app

### Option 2: Direct Token (For API Testing)
Bypass OAuth flow entirely and get a token directly. Use for quick API tests.

```bash
# Get token
TOKEN=$(curl -s http://localhost:3200/dev/token/issue \
  -H "Content-Type: application/json" \
  -d '{"email":"me@eventuras.com"}' | jq -r .access_token)

# Use in your app
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Use when:** Testing APIs, curl commands, quick debugging

### Option 3: Mock IdP (Manual Testing)
Full interactive flow with mock Vipps/HelseID.

1. Start OAuth flow normally in your app
2. Redirected to Idem login page
3. Click "Login with Vipps (Mock)" or "Login with HelseID (Mock)"
4. Fill in form with test data
5. Redirected back to your app with auth code
6. App exchanges code for tokens

**Use when:** Testing UI flows, consent screens, multi-step authentication

## Staging (Realistic Testing)
- Uses real Vipps Test + HelseID Test
- Requires test accounts (Vipps test app, HelseID test credentials)
- Behaves exactly like production
- No dev shortcuts available

## Production
- Real Vipps + HelseID
- No shortcuts available
- `dev_login_as` parameter is silently ignored
```

## References
- ADR 0010: Dev-only Features and Mock IdP
- ADR 0014: Security Hardening Baseline
- OWASP Development Environment Security
