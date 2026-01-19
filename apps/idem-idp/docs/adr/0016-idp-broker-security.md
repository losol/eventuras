# ADR 0016 — IdP Broker Security and Threat Model

## Status
Accepted

## Context
IdP brokering introduces external dependencies and complex OAuth/OIDC flows that significantly expand the attack surface. Unlike a standalone IdP where we control all components, broker flows involve:
- User's browser (untrusted)
- Upstream IdP (semi-trusted external system)
- Our broker service (trusted)

Attacks specific to OAuth/OIDC broker flows include:
- Authorization code interception
- State parameter manipulation
- Nonce bypass/replay attacks
- Redirect URI manipulation (open redirect)
- Token substitution attacks
- Mix-up attacks (confusing multiple IdPs)
- IdP impersonation

Without explicit security measures, these attacks can lead to:
- Account takeover
- Unauthorized access
- Identity confusion (linking wrong identities)
- Session hijacking

## Decision

### 1. OAuth/OIDC Security Baseline

**Mandatory Security Features:**
- ✅ PKCE (Proof Key for Code Exchange) for all flows
- ✅ State parameter validation
- ✅ Nonce validation (OIDC)
- ✅ Strict redirect URI validation
- ✅ Token binding to prevent substitution
- ✅ IdP issuer validation
- ✅ JWT signature verification

### 2. State Parameter Security

**State Generation:**
```typescript
import crypto from 'crypto';

// Generate cryptographically secure state
export function generateState(context: {
  tenant_id: string;
  provider_key: string;
  account_id?: string; // If linking to existing account
  return_url?: string;
}): { state: string; stateRecord: StateRecord } {
  // Generate random state token (base64url, 32 bytes = 256 bits)
  const stateToken = crypto.randomBytes(32).toString('base64url');

  // Create state record with metadata
  const stateRecord = {
    state: stateToken,
    tenant_id: context.tenant_id,
    provider_key: context.provider_key,
    account_id: context.account_id,
    return_url: context.return_url,
    created_at: new Date(),
    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    consumed: false,
    ip: context.ip, // Bind to IP for extra security
    user_agent: context.user_agent,
  };

  return { state: stateToken, stateRecord };
}

// Store state in database (not cookie - prevents tampering)
await db.insert(idpStates).values(stateRecord);
```

**State Validation on Callback:**
```typescript
app.get('/idp/:provider/callback', async (req, res) => {
  const { state, code } = req.query;

  // 1. CRITICAL: Validate state exists and is not consumed
  const stateRecord = await db.query.idpStates.findFirst({
    where: and(
      eq(idpStates.state, state),
      eq(idpStates.consumed, false),
      gt(idpStates.expires_at, new Date())
    ),
  });

  if (!stateRecord) {
    logger.error({ state }, 'Invalid or expired state parameter');
    return res.status(400).json({ error: 'Invalid state' });
  }

  // 2. Verify provider matches
  if (stateRecord.provider_key !== req.params.provider) {
    logger.error({
      expectedProvider: stateRecord.provider_key,
      actualProvider: req.params.provider,
    }, 'State provider mismatch - potential mix-up attack');

    await markStateAsConsumed(state); // Consume to prevent retry
    return res.status(400).json({ error: 'Provider mismatch' });
  }

  // 3. OPTIONAL: IP/UA binding (strict mode)
  if (process.env.IDP_STRICT_MODE === 'true') {
    if (stateRecord.ip !== req.ip || stateRecord.user_agent !== req.get('user-agent')) {
      logger.warn({
        state,
        originalIp: stateRecord.ip,
        callbackIp: req.ip,
      }, 'State IP/UA mismatch - potential attack');

      // Optional: reject callback
      // await markStateAsConsumed(state);
      // return res.status(400).json({ error: 'Invalid request' });
    }
  }

  // 4. Mark state as consumed (prevent replay)
  await db.update(idpStates)
    .set({ consumed: true, consumed_at: new Date() })
    .where(eq(idpStates.state, state));

  // 5. Continue with token exchange
  // ...
});
```

**State Cleanup Job:**
```typescript
// Daily cleanup of expired states
cron.schedule('0 3 * * *', async () => {
  const result = await db.delete(idpStates)
    .where(
      or(
        lt(idpStates.expires_at, new Date()), // Expired
        and(
          eq(idpStates.consumed, true),
          lt(idpStates.consumed_at, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Consumed > 24h ago
        )
      )
    );

  logger.info({ deleted: result.rowCount }, 'IdP state cleanup completed');
});
```

### 3. PKCE (Proof Key for Code Exchange)

**Mandatory for ALL IdP flows** (not just public clients):

```typescript
// Generate code verifier (43-128 characters)
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url'); // 43 chars
}

// Generate code challenge (SHA-256 of verifier)
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Authorization request
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

// Store verifier with state
await db.update(idpStates)
  .set({ code_verifier: codeVerifier })
  .where(eq(idpStates.state, stateToken));

// Send to IdP
const authUrl = new URL(provider.authorization_endpoint);
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
// ...
```

**Token Exchange with PKCE:**
```typescript
// Callback handler
const stateRecord = await validateState(state);

// Token request
const tokenResponse = await fetch(provider.token_endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUri,
    client_id: providerConfig.client_id,
    client_secret: providerConfig.client_secret,
    code_verifier: stateRecord.code_verifier, // PKCE verification
  }),
});
```

### 4. Nonce Validation (OIDC)

**Nonce Generation:**
```typescript
// Generate nonce when starting authorization
const nonce = crypto.randomBytes(16).toString('base64url');

// Store nonce with state
await db.update(idpStates)
  .set({ nonce })
  .where(eq(idpStates.state, stateToken));

// Send to IdP
authUrl.searchParams.set('nonce', nonce);
```

**Nonce Verification in ID Token:**
```typescript
// After token exchange, verify ID token
const idToken = tokenResponse.id_token;
const decoded = jwt.decode(idToken, { complete: true });

// 1. Verify signature
const jwks = await getIdPJwks(provider);
const verified = await jose.jwtVerify(idToken, jwks);

// 2. Verify nonce
if (verified.payload.nonce !== stateRecord.nonce) {
  logger.error({
    expectedNonce: stateRecord.nonce,
    actualNonce: verified.payload.nonce,
  }, 'ID token nonce mismatch - potential replay attack');

  throw new Error('Invalid nonce');
}

// 3. Verify issuer
if (verified.payload.iss !== provider.issuer) {
  logger.error({
    expectedIssuer: provider.issuer,
    actualIssuer: verified.payload.iss,
  }, 'ID token issuer mismatch');

  throw new Error('Invalid issuer');
}

// 4. Verify audience
if (verified.payload.aud !== providerConfig.client_id) {
  logger.error({
    expectedAud: providerConfig.client_id,
    actualAud: verified.payload.aud,
  }, 'ID token audience mismatch');

  throw new Error('Invalid audience');
}

// 5. Verify expiry
if (verified.payload.exp < Date.now() / 1000) {
  throw new Error('ID token expired');
}
```

### 5. Redirect URI Validation

**Strict Whitelist (NO wildcards):**
```typescript
// Database: idem_idp_provider_tenants
{
  redirect_uris: [
    'https://idem.eventuras.com/idp/vipps/callback',
    'https://idem-staging.eventuras.com/idp/vipps/callback',
    // NO wildcards like 'https://*.eventuras.com/*'
  ]
}

// Validation on callback
const callbackUri = `${req.protocol}://${req.get('host')}${req.path}`;

if (!providerConfig.redirect_uris.includes(callbackUri)) {
  logger.error({
    receivedUri: callbackUri,
    allowedUris: providerConfig.redirect_uris,
  }, 'Redirect URI not in whitelist');

  return res.status(400).json({ error: 'Invalid redirect URI' });
}
```

**Additional Redirect URI Security:**
```typescript
// Normalize URIs before comparison
function normalizeUri(uri: string): string {
  const url = new URL(uri);
  // Remove default ports
  if ((url.protocol === 'https:' && url.port === '443') ||
      (url.protocol === 'http:' && url.port === '80')) {
    url.port = '';
  }
  // Remove trailing slash
  url.pathname = url.pathname.replace(/\/$/, '');
  return url.toString();
}

// Compare normalized URIs
const normalizedCallback = normalizeUri(callbackUri);
const normalizedWhitelist = providerConfig.redirect_uris.map(normalizeUri);

if (!normalizedWhitelist.includes(normalizedCallback)) {
  // Reject
}
```

### 6. Token Substitution Prevention

**Token Binding via State:**
```typescript
// Store expected subject (if linking identity)
await db.update(idpStates)
  .set({
    expected_account_id: existingAccountId, // If linking to existing account
  })
  .where(eq(idpStates.state, stateToken));

// After receiving ID token, verify subject matches
if (stateRecord.expected_account_id) {
  const existingIdentity = await db.query.identities.findFirst({
    where: and(
      eq(identities.account_id, stateRecord.expected_account_id),
      eq(identities.provider, provider.key)
    ),
  });

  if (existingIdentity && existingIdentity.provider_subject !== idToken.sub) {
    logger.error({
      expectedSub: existingIdentity.provider_subject,
      actualSub: idToken.sub,
      accountId: stateRecord.expected_account_id,
    }, 'Token substitution detected - subject mismatch');

    throw new Error('Token substitution detected');
  }
}
```

**Token Replay Prevention:**
```typescript
// Store ID token hash to prevent replay
const idTokenHash = crypto.createHash('sha256')
  .update(idToken)
  .digest('hex');

// Check if ID token already used
const existingToken = await db.query.usedIdTokens.findFirst({
  where: eq(usedIdTokens.token_hash, idTokenHash),
});

if (existingToken) {
  logger.error({ tokenHash: idTokenHash }, 'ID token replay detected');
  throw new Error('Token already used');
}

// Store hash (with expiry based on token exp claim)
await db.insert(usedIdTokens).values({
  token_hash: idTokenHash,
  provider_key: provider.key,
  subject: idToken.sub,
  expires_at: new Date(idToken.exp * 1000),
});

// Cleanup job removes expired token hashes
```

### 7. Mix-Up Attack Prevention

**Provider-Specific Callback URLs:**
```typescript
// Each provider gets dedicated callback URL
const callbackRoutes = {
  vipps: '/idp/vipps/callback',
  helseid: '/idp/helseid/callback',
  idporten: '/idp/idporten/callback',
  // ...
};

// Route validation
app.get('/idp/:provider/callback', async (req, res) => {
  const expectedPath = callbackRoutes[req.params.provider];

  if (req.path !== expectedPath) {
    logger.error({
      provider: req.params.provider,
      expectedPath,
      actualPath: req.path,
    }, 'Mix-up attack detected - wrong callback URL');

    return res.status(400).json({ error: 'Invalid callback' });
  }

  // Continue...
});
```

**Issuer Validation (Defense in Depth):**
```typescript
// Verify ID token issuer matches expected provider
const expectedIssuer = provider.issuer;
const actualIssuer = idToken.iss;

if (expectedIssuer !== actualIssuer) {
  logger.error({
    provider: provider.key,
    expectedIssuer,
    actualIssuer,
  }, 'Issuer mismatch - potential mix-up attack');

  throw new Error('Issuer mismatch');
}
```

### 8. Rate Limiting for IdP Endpoints

**Prevent Brute Force and DoS:**
```typescript
import rateLimit from 'express-rate-limit';

// Authorization endpoint (starts flow)
const idpAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 authorization requests per IP
  message: 'Too many login attempts, please try again later',
});

app.get('/idp/:provider/authorize', idpAuthLimiter, async (req, res) => {
  // ...
});

// Callback endpoint (more lenient, but still limited)
const idpCallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Higher limit (legitimate redirects from IdP)
  message: 'Too many callback attempts',
});

app.get('/idp/:provider/callback', idpCallbackLimiter, async (req, res) => {
  // ...
});
```

**Per-User Rate Limiting (if authenticated):**
```typescript
// Limit identity linking attempts per user
const linkIdentityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 link attempts per hour
  keyGenerator: (req) => req.session.userId || req.ip,
  message: 'Too many identity link attempts',
});

app.post('/account/link-identity/:provider', requireAuth, linkIdentityLimiter, async (req, res) => {
  // ...
});
```

### 9. IdP-Specific Security Considerations

**Vipps:**
- ✅ Use `sub` claim as unique identifier (do NOT use phone number)
- ✅ Verify `sub` is persistent across sessions
- ⚠️ Phone number can change (user porting number)
- ✅ Verify `phone_number_verified` claim is true
- ✅ Request minimal scopes (openid, profile, email)

**HelseID:**
- ✅ Verify `helseid://claims/identity/pid` (Norwegian national ID)
- ✅ Check `helseid://claims/identity/security_level` (Level 3 or 4 required)
- ✅ Validate practitioner claims for healthcare users
- ⚠️ Test environment has separate issuer (do not mix)

**ID-porten:**
- ✅ Verify `pid` claim (Norwegian national ID)
- ✅ Check `acr` (authentication context) matches required level
- ✅ Use `idporten:dcr:client` for on-demand client registration (if applicable)
- ⚠️ Strict PKCE requirement (Level 3+)

**Azure AD / Entra ID:**
- ✅ Verify `tid` (tenant ID) matches expected organization
- ✅ Use `oid` (object ID) as primary identifier, not email
- ⚠️ Email can change or be non-unique across tenants
- ✅ Validate `iss` includes correct tenant ID

**Google:**
- ✅ Use `sub` as unique identifier
- ✅ Verify `email_verified` is true before using email
- ⚠️ Email can be changed or recycled
- ✅ Check `hd` (hosted domain) if restricting to specific Google Workspace

**GitHub:**
- ✅ Use `id` (numeric) as unique identifier, not `login` (username)
- ⚠️ Usernames can be changed
- ✅ Request `user:email` scope to get verified emails
- ✅ Check `email_verified` field in email list

### 10. Error Handling and Monitoring

**Error Types:**
```typescript
// Custom error types for IdP broker failures
export class IdPBrokerError extends Error {
  constructor(
    public code: string,
    public provider: string,
    public details: any,
    message: string
  ) {
    super(message);
  }
}

// Specific error codes
const IdPErrorCodes = {
  INVALID_STATE: 'invalid_state',
  EXPIRED_STATE: 'expired_state',
  STATE_REPLAY: 'state_replay',
  NONCE_MISMATCH: 'nonce_mismatch',
  ISSUER_MISMATCH: 'issuer_mismatch',
  TOKEN_SUBSTITUTION: 'token_substitution',
  REDIRECT_URI_INVALID: 'redirect_uri_invalid',
  PROVIDER_ERROR: 'provider_error',
  TOKEN_EXCHANGE_FAILED: 'token_exchange_failed',
  SIGNATURE_VERIFICATION_FAILED: 'signature_verification_failed',
};
```

**Monitoring Metrics:**
```typescript
// Track IdP flow metrics
interface IdPMetrics {
  provider: string;
  metric: string;
  value: number;
  timestamp: Date;
}

// Increment on each event
async function trackIdPMetric(provider: string, metric: string) {
  await metricsCollector.increment(`idp.${provider}.${metric}`);
}

// Metrics to track:
// - idp.{provider}.authorize.started
// - idp.{provider}.callback.received
// - idp.{provider}.callback.success
// - idp.{provider}.callback.error.{error_code}
// - idp.{provider}.token_exchange.success
// - idp.{provider}.token_exchange.failed
// - idp.{provider}.identity_linked
```

**Alert Conditions:**
```typescript
// Alert if error rate exceeds threshold
// Example: If > 10% of callbacks fail for a provider in 15 min window

// Alert if state replay detected (indicates attack)
// Alert if token substitution detected (indicates attack)
// Alert if provider becomes unavailable (all token exchanges fail)
```

## Database Schema Extension

**IdP State Table:**
```sql
CREATE TABLE idem_idp_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT UNIQUE NOT NULL,
  tenant_id UUID NOT NULL REFERENCES idem_tenants(id),
  provider_key TEXT NOT NULL,
  account_id UUID REFERENCES idem_accounts(id),
  nonce TEXT,
  code_verifier TEXT,
  return_url TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT false,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX idx_idp_states_state ON idem_idp_states(state) WHERE consumed = false;
CREATE INDEX idx_idp_states_expires ON idem_idp_states(expires_at) WHERE consumed = false;
```

**Used ID Token Hashes (Replay Prevention):**
```sql
CREATE TABLE idem_used_id_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,
  provider_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_used_id_tokens_hash ON idem_used_id_tokens(token_hash);
CREATE INDEX idx_used_id_tokens_expires ON idem_used_id_tokens(expires_at);
```

## Consequences

### Positive
- **Comprehensive Attack Prevention**: Covers all major OAuth/OIDC broker attacks
- **Defense in Depth**: Multiple layers of validation (state, nonce, PKCE, issuer, signature)
- **Per-Provider Security**: IdP-specific considerations prevent subtle vulnerabilities
- **Audit Trail**: All security events logged for incident response
- **Rate Limiting**: Prevents brute force and DoS attacks

### Negative
- **Increased Complexity**: Multiple validation steps add code complexity
- **Performance Overhead**: Database lookups for state/nonce validation (~2-3ms)
- **Storage Requirements**: State and token hash tables grow over time (mitigated by cleanup)
- **Strict Mode Trade-offs**: IP/UA binding may reject legitimate users in some scenarios

### Risks and Mitigations

**Risk: Upstream IdP compromise (attacker controls IdP)**
- **Mitigation**: Cannot fully prevent (trust model requires trusting IdP)
- **Mitigation**: Monitor for suspicious patterns (mass account linking)
- **Mitigation**: Implement account verification workflows for high-value operations

**Risk: State table grows unbounded (DoS via state generation)**
- **Mitigation**: Rate limit authorization endpoint (10 req/15min per IP)
- **Mitigation**: Daily cleanup job removes expired states
- **Mitigation**: Alert if state table exceeds 100K records

**Risk: PKCE not supported by legacy IdPs**
- **Mitigation**: Document minimum IdP requirements
- **Mitigation**: Reject IdPs without PKCE support
- **Mitigation**: Consider proxy/wrapper for legacy IdPs (Phase 9)

**Risk: Clock skew causes token validation failures**
- **Mitigation**: Allow 5-minute clock skew tolerance in JWT verification
- **Mitigation**: Monitor for abnormal validation failures
- **Mitigation**: NTP synchronization on servers

## Testing Strategy

### Automated Security Tests
```typescript
describe('IdP Broker Security', () => {
  it('should reject replayed state parameter', async () => {
    const { state } = await startIdPFlow('vipps');

    // First callback - should succeed
    await request(app).get(`/idp/vipps/callback?state=${state}&code=abc`);

    // Second callback with same state - should fail
    const res = await request(app).get(`/idp/vipps/callback?state=${state}&code=abc`);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid state');
  });

  it('should reject expired state', async () => {
    jest.useFakeTimers();
    const { state } = await startIdPFlow('vipps');

    // Fast-forward 11 minutes
    jest.advanceTimersByTime(11 * 60 * 1000);

    const res = await request(app).get(`/idp/vipps/callback?state=${state}&code=abc`);
    expect(res.status).toBe(400);
  });

  it('should reject ID token with wrong nonce', async () => {
    const { state, nonce } = await startIdPFlow('vipps');
    const idToken = generateFakeIdToken({ nonce: 'wrong_nonce' });

    const res = await simulateIdPCallback({ state, idToken });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid nonce');
  });

  it('should reject redirect URI not in whitelist', async () => {
    const res = await request(app)
      .get('/idp/vipps/callback?state=test&code=abc')
      .set('Host', 'attacker.com'); // Wrong host

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid redirect URI');
  });

  it('should prevent mix-up attack (wrong provider)', async () => {
    const { state } = await startIdPFlow('vipps');

    // Try to use Vipps state with HelseID callback
    const res = await request(app).get(`/idp/helseid/callback?state=${state}&code=abc`);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Provider mismatch');
  });
});
```

### Manual Security Testing (Pre-Production)
Before production deployment:
- [ ] Penetration test: State replay attacks
- [ ] Penetration test: State manipulation (modify state parameter)
- [ ] Penetration test: Nonce bypass attempts
- [ ] Penetration test: Token substitution (use valid token from different user)
- [ ] Penetration test: Redirect URI manipulation (open redirect)
- [ ] Penetration test: Mix-up attacks (confuse multiple IdPs)
- [ ] Penetration test: CSRF on authorization endpoint
- [ ] Load test: Rate limiting effectiveness
- [ ] Verify: All IdP-specific claims validated correctly
- [ ] Verify: Error monitoring and alerting works

### Recommended Tools
- Burp Suite Professional (OIDC/OAuth testing extensions)
- OWASP ZAP with OAuth/OIDC plugins
- oauth2-security-scanner
- Manual code review with OWASP OAuth 2.0 security checklist

## Implementation Timeline

**Phase 5 (IdP Broker):**
- State parameter generation and validation
- PKCE implementation (all flows)
- Nonce generation and validation
- Strict redirect URI validation
- Basic error handling and logging

**Phase 8 (Hardening):**
- Token substitution prevention
- Token replay prevention (hash storage)
- IP/UA binding (strict mode)
- Rate limiting on IdP endpoints
- Comprehensive security testing
- Monitoring and alerting

## References
- [OAuth 2.0 Security Best Current Practice (BCP)](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OAuth 2.0 Threat Model and Security Considerations (RFC 6819)](https://datatracker.ietf.org/doc/html/rfc6819)
- [PKCE (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 Mix-Up Attack](https://arxiv.org/abs/1601.01229)
- [OIDC Core Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- OWASP OAuth 2.0 Security Cheat Sheet
- ADR 0006 (IdP Broker Model)
- ADR 0014 (Security Hardening Baseline)
