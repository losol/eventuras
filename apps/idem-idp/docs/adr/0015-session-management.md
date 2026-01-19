# ADR 0015 — Session Management and Logout

## Status
Accepted

## Context
Session management in an OIDC provider is security-critical, especially in a federated environment with IdP brokering. Sessions must be:
- Protected against hijacking and fixation attacks
- Properly terminated on logout (local and federated)
- Cleaned up on expiry to prevent unbounded growth
- Tracked for security monitoring and compliance

Without proper session management, users remain authenticated longer than intended, and attacks like session fixation, hijacking, and replay become possible.

## Decision

### 1. Session Storage Model

**Backend Sessions (node-oidc-provider)**
Use `idem_oidc_store` for OIDC sessions via node-oidc-provider's Session model:
```typescript
// Session entry in idem_oidc_store
{
  name: 'Session',
  id: '<session_uid>',
  tenant_id: '<tenant_uuid>',
  account_id: '<account_uuid>',
  session_id: '<session_uid>', // Self-reference for logout fan-out
  expires_at: '<timestamp>',
  consumed_at: null,
  payload: {
    accountId: '<account_uuid>',
    loginTs: 1234567890,
    acr: 'urn:mace:incommon:iap:silver',
    amr: ['vipps', 'pwd'],
    // ... other session data
  }
}
```

**Frontend Sessions (Admin UI / Interaction UI)**
Use express-session with PostgreSQL backend:
```typescript
import session from 'express-session';
import pgSession from 'connect-pg-simple';

const PgSession = pgSession(session);

app.use(session({
  store: new PgSession({
    tableName: 'idem_express_sessions', // Separate table for express sessions
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  name: 'idem.sid', // Don't use default 'connect.sid'
  rolling: true, // Reset expiry on each request (activity-based timeout)
}));
```

**Database Table for Express Sessions:**
```sql
CREATE TABLE idem_express_sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_express_sessions_expire ON idem_express_sessions(expire);
```

### 2. Session Fixation Prevention

**Token Regeneration on Authentication:**
```typescript
// After successful authentication (login or IdP callback)
app.post('/interaction/:uid/login', async (req, res) => {
  // ... authentication logic

  // CRITICAL: Regenerate session ID to prevent fixation
  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Store user identity in new session
  req.session.userId = user.id;
  req.session.loginTimestamp = Date.now();

  // Continue with OIDC flow
  // ...
});
```

**Session ID Rotation on Privilege Elevation:**
```typescript
// When user gains admin privileges
app.post('/admin/elevate', requireAuth, async (req, res) => {
  // Verify admin credentials
  // ...

  // Regenerate session before granting admin access
  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  req.session.isAdmin = true;
  req.session.adminGrantedAt = Date.now();
});
```

### 3. Session Hijacking Prevention

**IP Address Binding (Optional - Strict Mode):**
```typescript
// Middleware to detect IP address changes
function sessionIpCheck(req, res, next) {
  if (!req.session.ipAddress) {
    // First request - store IP
    req.session.ipAddress = req.ip;
    return next();
  }

  if (req.session.ipAddress !== req.ip) {
    // IP changed - potential hijacking
    logger.warn({
      sessionId: req.sessionID,
      originalIp: req.session.ipAddress,
      newIp: req.ip,
      userId: req.session.userId,
    }, 'Session IP address mismatch - potential hijacking');

    // OPTION 1: Destroy session (strict)
    req.session.destroy();
    return res.status(401).json({ error: 'Session invalid' });

    // OPTION 2: Re-authenticate (lenient, for mobile networks)
    // return res.redirect('/login?reason=ip_change');
  }

  next();
}

// Apply to sensitive routes only (not all routes, breaks mobile users)
app.use('/admin', sessionIpCheck);
```

**User-Agent Fingerprinting:**
```typescript
// Store user agent on session creation
req.session.userAgent = req.get('user-agent');

// Verify on subsequent requests
function sessionFingerprintCheck(req, res, next) {
  if (req.session.userAgent && req.session.userAgent !== req.get('user-agent')) {
    logger.warn({
      sessionId: req.sessionID,
      originalUa: req.session.userAgent,
      newUa: req.get('user-agent'),
    }, 'Session user-agent mismatch');

    // Optional: force re-authentication for high-value operations
  }
  next();
}
```

**Absolute Session Timeout:**
```typescript
// Enforce maximum session lifetime regardless of activity
function absoluteSessionTimeout(req, res, next) {
  const maxLifetime = 8 * 60 * 60 * 1000; // 8 hours

  if (req.session.loginTimestamp) {
    const age = Date.now() - req.session.loginTimestamp;
    if (age > maxLifetime) {
      logger.info({
        sessionId: req.sessionID,
        userId: req.session.userId,
        age,
      }, 'Session exceeded maximum lifetime');

      req.session.destroy();
      return res.redirect('/login?reason=timeout');
    }
  }

  next();
}

app.use(absoluteSessionTimeout);
```

### 4. Logout Strategy

**Local Logout (Single Tenant):**
```typescript
app.post('/logout', async (req, res) => {
  const sessionUid = req.session.oidcSessionUid;
  const userId = req.session.userId;

  // 1. Destroy express session
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // 2. Revoke OIDC session (logout fan-out to all clients)
  if (sessionUid) {
    await db.update(oidcStore)
      .set({ consumed_at: new Date() })
      .where(
        and(
          eq(oidcStore.name, 'Session'),
          eq(oidcStore.id, sessionUid)
        )
      );

    // 3. Revoke all tokens associated with this session
    await db.update(oidcStore)
      .set({ consumed_at: new Date() })
      .where(eq(oidcStore.session_id, sessionUid));
  }

  // 4. Audit log
  await auditLog.record({
    tenant_id: req.tenant.id,
    actor_sub: userId,
    action: 'user.logout',
    resource: `session:${sessionUid}`,
    message: 'User logged out',
    ip: req.ip,
    user_agent: req.get('user-agent'),
  });

  res.redirect('/logged-out');
});
```

**Federated Logout (with IdP Broker):**
```typescript
app.post('/logout', async (req, res) => {
  const sessionUid = req.session.oidcSessionUid;
  const userId = req.session.userId;

  // 1. Find identity used for this session
  const identity = await db.query.identities.findFirst({
    where: and(
      eq(identities.account_id, userId),
      eq(identities.is_primary, true)
    ),
  });

  // 2. Destroy local session (same as above)
  await destroyLocalSession(req, sessionUid, userId);

  // 3. Build upstream logout URL if federated
  if (identity && identity.provider !== 'local') {
    const provider = await getIdPProvider(identity.provider);

    if (provider.end_session_endpoint) {
      // RP-Initiated Logout (OIDC)
      const logoutUrl = new URL(provider.end_session_endpoint);
      logoutUrl.searchParams.set('id_token_hint', req.session.idTokenHint);
      logoutUrl.searchParams.set('post_logout_redirect_uri',
        `${process.env.ISSUER}/logged-out`);

      return res.redirect(logoutUrl.toString());
    }
  }

  // No upstream logout needed (local user or no logout endpoint)
  res.redirect('/logged-out');
});
```

**Back-Channel Logout (Receive logout from upstream IdP):**
```typescript
// Endpoint to receive back-channel logout from upstream IdP
app.post('/idp/:provider/backchannel-logout', async (req, res) => {
  const { logout_token } = req.body;

  // 1. Verify logout token signature
  const provider = await getIdPProvider(req.params.provider);
  const verified = await verifyJwt(logout_token, provider.jwks);

  if (!verified) {
    return res.status(400).json({ error: 'Invalid logout token' });
  }

  // 2. Extract subject from logout token
  const { sub, sid } = verified.payload;

  // 3. Find local identity
  const identity = await db.query.identities.findFirst({
    where: and(
      eq(identities.provider, req.params.provider),
      eq(identities.provider_subject, sub)
    ),
  });

  if (!identity) {
    return res.status(404).json({ error: 'Unknown user' });
  }

  // 4. Revoke all sessions for this account
  await db.update(oidcStore)
    .set({ consumed_at: new Date() })
    .where(
      and(
        eq(oidcStore.name, 'Session'),
        eq(oidcStore.account_id, identity.account_id)
      )
    );

  // 5. Revoke all tokens
  await db.update(oidcStore)
    .set({ consumed_at: new Date() })
    .where(eq(oidcStore.account_id, identity.account_id));

  // 6. Audit log
  await auditLog.record({
    tenant_id: identity.tenant_id,
    actor_sub: identity.account_id,
    action: 'user.backchannel_logout',
    resource: `identity:${identity.id}`,
    message: `Back-channel logout from ${req.params.provider}`,
  });

  res.status(200).json({ success: true });
});
```

### 5. Session Cleanup Job

**Expired Session Cleanup:**
```typescript
// Daily job to clean up expired sessions
import cron from 'node-cron';

// Run at 2 AM daily
cron.schedule('0 2 * * *', async () => {
  logger.info('Starting session cleanup job');

  try {
    // 1. Cleanup express sessions
    const expressResult = await db.execute(sql`
      DELETE FROM idem_express_sessions
      WHERE expire < NOW()
    `);

    // 2. Cleanup OIDC sessions (already consumed or expired)
    const oidcResult = await db.delete(oidcStore)
      .where(
        and(
          eq(oidcStore.name, 'Session'),
          or(
            lt(oidcStore.expires_at, new Date()),
            isNotNull(oidcStore.consumed_at)
          )
        )
      );

    logger.info({
      expressSessionsDeleted: expressResult.rowCount,
      oidcSessionsDeleted: oidcResult.rowCount,
    }, 'Session cleanup completed');

    // 3. Alert if table size exceeds threshold
    const sessionCount = await db.select({ count: count() })
      .from(oidcStore)
      .where(eq(oidcStore.name, 'Session'));

    if (sessionCount[0].count > 100000) {
      logger.error({
        sessionCount: sessionCount[0].count,
      }, 'ALERT: Session table size exceeds 100K - investigate');

      // Send alert (email, Slack, PagerDuty, etc.)
      await sendAlert('session_table_size_high', {
        count: sessionCount[0].count,
        threshold: 100000,
      });
    }
  } catch (error) {
    logger.error({ error }, 'Session cleanup job failed');

    // Alert on failure
    await sendAlert('session_cleanup_failed', { error: error.message });
  }
});
```

**Monitor Cleanup Job Health:**
```typescript
// Track last successful cleanup
let lastCleanupSuccess: Date | null = null;

// Health check endpoint includes cleanup status
app.get('/healthz', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    checks: {
      database: 'ok',
      sessionCleanup: 'ok',
    },
  };

  // Alert if cleanup hasn't run in 48 hours
  if (lastCleanupSuccess) {
    const hoursSinceCleanup = (Date.now() - lastCleanupSuccess.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCleanup > 48) {
      health.checks.sessionCleanup = 'warning';
      health.status = 'degraded';
    }
  }

  res.json(health);
});
```

## Consequences

### Positive
- **Session Fixation Prevention**: Regenerating session IDs eliminates fixation attacks
- **Session Hijacking Detection**: IP/UA fingerprinting detects suspicious activity
- **Proper Logout**: Both local and federated logout properly terminate sessions
- **Back-Channel Logout**: Supports upstream IdP-initiated logout
- **Session Cleanup**: Prevents unbounded growth and removes stale sessions
- **Absolute Timeout**: Limits session lifetime even for active users
- **Audit Trail**: All logout events are logged for compliance

### Negative
- **IP Binding Breaks Mobile Users**: Cellular networks change IPs frequently
- **Additional Database Load**: Session checks add ~1 query per request
- **Federated Logout Complexity**: Upstream IdP may not support logout endpoints
- **Cleanup Job Dependency**: System health depends on cron job reliability

### Risks and Mitigations

**Risk: Session cleanup job fails for multiple days**
- **Mitigation**: Health check alerts if cleanup hasn't run in 48 hours
- **Mitigation**: Manual cleanup script for emergency use
- **Mitigation**: Monitor session table size, alert at 100K records

**Risk: IP binding breaks legitimate users (mobile, VPN, proxy)**
- **Mitigation**: Only apply IP binding to high-privilege operations (admin panel)
- **Mitigation**: Use lenient mode: log warning but don't destroy session
- **Mitigation**: Provide clear error message to user if session invalid

**Risk: Federated logout fails (upstream IdP unavailable)**
- **Mitigation**: Always destroy local session even if upstream logout fails
- **Mitigation**: Log failure for audit purposes
- **Mitigation**: Optionally queue retry for upstream logout

**Risk: Back-channel logout DoS attack (flood endpoint with fake tokens)**
- **Mitigation**: Rate limit back-channel logout endpoint (10 req/min per IP)
- **Mitigation**: Verify JWT signature before processing
- **Mitigation**: Monitor for abnormal logout patterns

## Testing Strategy

### Automated Tests
```typescript
describe('Session Management', () => {
  it('should regenerate session ID on login', async () => {
    const res1 = await request(app).get('/login');
    const cookie1 = res1.headers['set-cookie'][0];

    const res2 = await request(app)
      .post('/interaction/login')
      .set('Cookie', cookie1)
      .send({ username: 'test', password: 'test' });

    const cookie2 = res2.headers['set-cookie'][0];
    expect(cookie1).not.toEqual(cookie2); // Session ID changed
  });

  it('should enforce absolute session timeout', async () => {
    jest.useFakeTimers();

    const res1 = await loginUser('test');
    const cookie = res1.headers['set-cookie'][0];

    // Fast-forward 9 hours
    jest.advanceTimersByTime(9 * 60 * 60 * 1000);

    const res2 = await request(app)
      .get('/profile')
      .set('Cookie', cookie);

    expect(res2.status).toBe(302); // Redirect to login
    expect(res2.headers.location).toContain('reason=timeout');
  });

  it('should perform logout fan-out', async () => {
    const { sessionUid, cookie } = await loginUser('test');

    await request(app)
      .post('/logout')
      .set('Cookie', cookie);

    // Verify session marked as consumed
    const session = await db.query.oidcStore.findFirst({
      where: and(
        eq(oidcStore.name, 'Session'),
        eq(oidcStore.id, sessionUid)
      ),
    });

    expect(session.consumed_at).not.toBeNull();
  });

  it('should handle back-channel logout', async () => {
    const identity = await createTestIdentity('vipps');
    const logoutToken = await generateLogoutToken(identity);

    const res = await request(app)
      .post('/idp/vipps/backchannel-logout')
      .send({ logout_token: logoutToken });

    expect(res.status).toBe(200);

    // Verify all sessions for this user are revoked
    const sessions = await db.query.oidcStore.findMany({
      where: and(
        eq(oidcStore.name, 'Session'),
        eq(oidcStore.account_id, identity.account_id)
      ),
    });

    sessions.forEach(s => expect(s.consumed_at).not.toBeNull());
  });
});
```

### Manual Verification
Before production:
- [ ] Test session regeneration on login (verify cookie changes)
- [ ] Test absolute timeout (wait 8+ hours, session expires)
- [ ] Test local logout (session destroyed, tokens revoked)
- [ ] Test federated logout (redirects to upstream IdP logout)
- [ ] Test back-channel logout (receive logout from Vipps, HelseID)
- [ ] Test session cleanup job (expired sessions removed)
- [ ] Test cleanup job failure alert (simulate failure, verify alert)
- [ ] Test IP binding (change IP mid-session, verify behavior)

## Implementation Timeline

**Phase 3 (OIDC Provider):**
- Basic session management (express-session + PostgreSQL)
- Session fixation prevention (regenerate on login)
- Local logout (destroy session + revoke tokens)
- Session cleanup job (daily cron)

**Phase 5 (IdP Broker):**
- Federated logout (RP-initiated logout)
- Back-channel logout endpoint
- Upstream IdP session linking

**Phase 8 (Hardening):**
- IP/UA fingerprinting (optional strict mode)
- Absolute session timeout enforcement
- Cleanup job monitoring and alerting
- Session hijacking detection logging

## References
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OIDC Session Management](https://openid.net/specs/openid-connect-session-1_0.html)
- [OIDC Back-Channel Logout](https://openid.net/specs/openid-connect-backchannel-1_0.html)
- [OIDC RP-Initiated Logout](https://openid.net/specs/openid-connect-rpinitiated-1_0.html)
- node-oidc-provider Session documentation
- ADR 0005 (OIDC Provider and Store)
- ADR 0011 (Audit and Compliance)
