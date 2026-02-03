# ADR 0007 — Admin RBAC

## Status

Superseded by [ADR 0018](0018-per-client-rbac.md)

*Previously: Accepted (Updated 2026-01-30 for simplified schema with systemRole on accounts)*

## Context

Administrative access to Idem must be strictly controlled. Admins can manage OAuth clients, view audit logs, manage user accounts, and configure IdP integrations. With Idem serving Eventuras applications exclusively in a single-tenant model, we need clear RBAC without multi-tenancy complexity.

## Decision

### Admin Authentication

**Admins are regular user accounts with elevated privileges**. They authenticate using the same methods as regular users:

**Recommended for Admins:**
- ✅ **Vipps** (Norwegian BankID-backed identity verification)
- ✅ **HelseID** (Norwegian health sector identity)

**Acceptable for Admins:**
- ✅ **OTP via SMS/Email** (passwordless, but weaker than Vipps/HelseID)

**Not Recommended for Admins:**
- ⚠️ **Social login** (Facebook, Google, Discord, GitHub) - Lower assurance level

**Admin Authentication Flow:**
```
1. Admin navigates to /admin
2. Redirected to Idem's OIDC login (if not authenticated)
3. Admin chooses login method (Vipps, HelseID, OTP, social)
4. After successful authentication, Idem checks admin role grants
5. If user has admin role → grant access to /admin
6. If user lacks admin role → 403 Forbidden
```

### Admin Authorization (RBAC)

**Global Roles (Single-Tenant):**

Idem uses **2 global roles** for the single-tenant architecture:

| Role | Scope | Permissions |
|------|-------|-------------|
| `system_admin` | Global | Full read/write access to all resources |
| `admin_reader` | Global | Read-only access to all resources (audit logs, user data, OAuth clients) |

**Removed Roles (Multi-Tenant):**
- ❌ `org_admin` (no organizations)
- ❌ `tenant_admin` (no tenants)
- ❌ `org_reader` (no organizations)
- ❌ `tenant_reader` (no tenants)

### Database Model

**Simplified Approach: systemRole on Accounts Table**

Admin roles are stored directly on the `accounts` table for single-tenant simplicity:

```sql
CREATE TABLE idem.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identity
  primary_email TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,

  -- Profile fields
  given_name TEXT,
  middle_name TEXT,
  family_name TEXT,
  display_name TEXT NOT NULL,
  phone TEXT,
  birthdate DATE,
  locale TEXT DEFAULT 'nb-NO',
  timezone TEXT DEFAULT 'Europe/Oslo',
  picture TEXT,

  -- System role (admin authorization)
  system_role TEXT,
  -- NULL = regular user; allowed values: 'system_admin' (full admin), 'admin_reader' (read-only admin)
  -- Note: Allowed values are enforced at the application layer; no DB CHECK constraint is defined

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP  -- Soft delete
);
```

**Benefits:**
- No separate tables needed for admin tracking
- Single query to check admin status (no joins)
- Simpler audit trail (track account updates directly)
- Easier to grant/revoke admin access (simple UPDATE)

### Authorization Flow

**Request-Time Authorization:**
```typescript
// middleware/requireAdmin.ts
export async function requireAdmin(req, res, next) {
  const accountId = req.session?.accountId;

  if (!accountId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if account has admin privileges (simple single query)
  const account = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!account || !account.systemRole) {
    await auditLog.log({
      action: 'admin_access_denied',
      accountId,
      reason: 'No system role',
    });
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // Attach admin context to request
  req.admin = {
    accountId: account.id,
    systemRole: account.systemRole,  // 'system_admin' or 'admin_reader'
    displayName: account.displayName,
  };

  next();
}

// Usage in routes
app.use('/admin/*', requireAdmin);
```

**Write Operations Check:**
```typescript
export async function requireWriteAccess(req, res, next) {
  if (req.admin.systemRole !== 'system_admin') {
    await auditLog.log({
      action: 'write_access_denied',
      accountId: req.admin.accountId,
      systemRole: req.admin.systemRole,
    });
    return res.status(403).json({ error: 'Forbidden: system_admin role required' });
  }
  next();
}

// Usage for write operations
app.post('/admin/oauth-clients', requireWriteAccess, createOAuthClient);
app.delete('/admin/users/:id', requireWriteAccess, deleteUser);
```

### Admin Security Hardening

**1. Session Timeout**

Admin sessions should have **shorter timeouts** than regular user sessions:

```typescript
const SESSION_TIMEOUT = {
  regular: 24 * 60 * 60 * 1000,  // 24 hours
  admin: 4 * 60 * 60 * 1000,     // 4 hours for admins
};

// Set session timeout based on admin status
if (req.admin) {
  req.session.cookie.maxAge = SESSION_TIMEOUT.admin;
}
```

**2. Re-Authentication for Sensitive Operations**

Require re-authentication (step-up auth) for critical operations:

```typescript
// Sensitive operations (e.g., deleting users, rotating keys)
async function requireRecentAuth(req, res, next) {
  const lastAuthTime = req.session.lastAuthTime;
  const fiveMinutes = 5 * 60 * 1000;

  if (!lastAuthTime || Date.now() - lastAuthTime > fiveMinutes) {
    return res.status(401).json({
      error: 'Re-authentication required',
      redirect: '/admin/re-auth?return_to=' + req.originalUrl,
    });
  }
  next();
}

app.delete('/admin/users/:id', requireRecentAuth, deleteUser);
app.post('/admin/keys/rotate', requireRecentAuth, rotateKeys);
```

**3. Audit Logging**

**All admin actions MUST be audit logged**:

```typescript
await auditLog.log({
  action: 'oauth_client_created',
  principalId: req.admin.principalId,
  resource: 'oauth_clients',
  resourceId: newClient.id,
  details: {
    client_id: newClient.clientId,
    redirect_uris: newClient.redirectUris,
  },
});
```

**4. IP Whitelisting (Optional)**

For production, consider restricting admin access to known IP ranges:

```typescript
// middleware/adminIpWhitelist.ts
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

export function checkAdminIpWhitelist(req, res, next) {
  if (process.env.NODE_ENV === 'production' && ADMIN_IP_WHITELIST.length > 0) {
    const clientIp = req.ip;
    if (!ADMIN_IP_WHITELIST.includes(clientIp)) {
      await auditLog.log({
        action: 'admin_access_blocked',
        reason: 'IP not whitelisted',
        clientIp,
      });
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  next();
}

app.use('/admin/*', checkAdminIpWhitelist, requireAdmin);
```

**5. MFA Requirement (Future Enhancement)**

Consider requiring MFA for all admin accounts:

```typescript
// Phase 2 enhancement
async function requireMfa(req, res, next) {
  const account = await getAccount(req.session.accountId);

  if (req.admin && !account.mfaEnabled) {
    return res.status(403).json({
      error: 'MFA required for admin access',
      redirect: '/account/mfa/setup',
    });
  }
  next();
}
```

### Granting Admin Access

**Initial Bootstrap:**

```sql
-- Create first system_admin (done manually in production)
UPDATE idem.accounts
SET system_role = 'system_admin'
WHERE id = 'existing-account-uuid';
```

**Granting Admin via Admin UI:**

```typescript
// POST /admin/system-roles
async function grantAdminAccess(req, res) {
  const { accountId, systemRole } = req.body;  // systemRole: 'system_admin' | 'admin_reader'

  // Only system_admin can grant admin access
  if (req.admin.systemRole !== 'system_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Update account with system role
  const [updatedAccount] = await db
    .update(accounts)
    .set({
      systemRole,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, accountId))
    .returning();

  await auditLog.log({
    action: 'system_role_granted',
    accountId: req.admin.accountId,
    targetAccountId: accountId,
    systemRole,
  });

  res.json({ success: true, account: updatedAccount });
}
```

### Revoking Admin Access

```typescript
// DELETE /admin/system-roles/:accountId
async function revokeAdminAccess(req, res) {
  const { accountId } = req.params;

  // Only system_admin can revoke
  if (req.admin.systemRole !== 'system_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Prevent self-revocation
  if (accountId === req.admin.accountId) {
    return res.status(400).json({ error: 'Cannot revoke your own admin access' });
  }

  // Remove system role from account
  const [updatedAccount] = await db
    .update(accounts)
    .set({
      systemRole: null,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, accountId))
    .returning();

  await auditLog.log({
    action: 'system_role_revoked',
    accountId: req.admin.accountId,
    targetAccountId: accountId,
  });

  res.json({ success: true, account: updatedAccount });
}
```

## Consequences

### Positive

- **Clear Separation**: Authentication (who are you?) vs Authorization (what can you do?)
- **Flexible Auth Methods**: Admins can use any supported login method
- **Strong Auditability**: All admin grants/revocations logged with who did it
- **Reversible Access**: Admin access can be revoked instantly (no token re-issuance needed)
- **Request-Time Authorization**: No stale permissions in long-lived tokens
- **Simplified Model**: Only 2 roles for single-tenant architecture

### Negative

- **Database Lookups**: Authorization requires DB query on each request
  - **Mitigation**: Caching with short TTL (5-15 minutes)
  - **Mitigation**: Index on `system_role` makes lookups fast (<1ms)
  - **Note**: With simplified schema, this is now a single-table query (no joins)
- **Admin Account Security**: If admin account is compromised, attacker has elevated privileges
  - **Mitigation**: Recommend Vipps/HelseID (strong authentication)
  - **Mitigation**: Shorter session timeouts for admins
  - **Mitigation**: Comprehensive audit logging for forensics
  - **Mitigation**: Re-authentication for sensitive operations

### Security Risks and Mitigations

**Risk: Admin account compromise**
- **Mitigation**: Recommend Vipps/HelseID over social login
- **Mitigation**: Require MFA for admin accounts (future)
- **Mitigation**: IP whitelisting (optional)
- **Mitigation**: Monitor admin activity for anomalies

**Risk: Privilege escalation**
- **Mitigation**: Only `system_admin` can grant/revoke admin access
- **Mitigation**: Cannot self-revoke (prevents accidents)
- **Mitigation**: All grants/revocations audit logged with granter info

**Risk: Stale admin sessions**
- **Mitigation**: 4-hour session timeout (vs 24 hours for regular users)
- **Mitigation**: Re-authentication required for sensitive operations

**Risk: Performance overhead from DB lookups**
- **Mitigation**: Partial index on `account_id` (fast lookups)
- **Mitigation**: Cache admin status with 5-15 minute TTL
- **Mitigation**: Event-driven cache invalidation when roles change

## Testing Strategy

### Automated Tests

```typescript
describe('Admin RBAC', () => {
  it('should deny admin access to regular users', async () => {
    const regularUser = await createAccount('user@example.com');
    const session = await loginAs(regularUser.id);

    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', session.cookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Admin access required');
  });

  it('should grant admin access after role grant', async () => {
    const account = await createAccount('admin@example.com');

    // Grant system_admin role
    await db
      .update(accounts)
      .set({ systemRole: 'system_admin' })
      .where(eq(accounts.id, account.id));

    const session = await loginAs(account.id);

    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', session.cookie);

    expect(res.status).toBe(200);
  });

  it('should deny write access to admin_reader', async () => {
    const account = await createAccount('reader@example.com');
    await grantRole(account.id, 'admin_reader');
    const session = await loginAs(account.id);

    const res = await request(app)
      .post('/admin/oauth-clients')
      .set('Cookie', session.cookie)
      .send({ clientId: 'test-client' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('system_admin role required');
  });

  it('should audit log all admin actions', async () => {
    const admin = await createSystemAdmin();
    const session = await loginAs(admin.id);

    await request(app)
      .delete('/admin/users/some-user-id')
      .set('Cookie', session.cookie);

    const logs = await db.select().from(auditLog)
      .where(eq(auditLog.action, 'user_deleted'))
      .where(eq(auditLog.accountId, admin.id));

    expect(logs).toHaveLength(1);
    expect(logs[0].resourceId).toBe('some-user-id');
  });

  it('should enforce admin session timeout', async () => {
    const admin = await createSystemAdmin();
    const session = await loginAs(admin.accountId);

    // Fast-forward 5 hours
    jest.advanceTimersByTime(5 * 60 * 60 * 1000);

    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', session.cookie);

    expect(res.status).toBe(401);  // Session expired
  });
});
```

### Manual Verification

Before production deployment:

- [ ] Create first `system_admin` via SQL UPDATE (bootstrap)
- [ ] Verify admin can log in via Vipps/HelseID
- [ ] Verify admin can access `/admin/*` endpoints
- [ ] Verify account with `system_role='admin_reader'` can read but not write
- [ ] Verify accounts with `system_role=null` get 403 on `/admin/*`
- [ ] Verify admin actions are audit logged with accountId
- [ ] Verify admin sessions expire after 4 hours
- [ ] Test admin access revocation (instant effect with simple UPDATE)
- [ ] Test self-revocation prevention
- [ ] Verify re-authentication prompt for sensitive operations

## References

- ADR 0001: System Scope (authentication methods)
- ADR 0011: Audit and Compliance (audit logging strategy)
- ADR 0014: Security Hardening Baseline (session management)
- ADR 0015: Session Management and Logout
- Development Plan: Phase 4 (Admin RBAC implementation)
