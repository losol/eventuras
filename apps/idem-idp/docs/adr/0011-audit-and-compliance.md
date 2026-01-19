# ADR 0011 — Audit and Compliance

## Status
Accepted

## Context
Administrative and security-sensitive actions must be traceable for compliance, incident response, and debugging.
However, audit logs themselves can become a security liability if they contain secrets, tokens, or sensitive PII.

## Decision

### Audit Log Schema
Introduce an immutable audit log (`idem_audit_log`) with:
- Human-readable `message` for operators
- Structured `before`/`after` state as JSONB
- Actor identification (`actor_sub`)
- Tenant isolation (`tenant_id`)
- Request metadata (`ip`, `user_agent`)

### What to Audit
**Always audit:**
- Admin actions (create/update/delete organizations, tenants, users, clients)
- RBAC changes (role grants/revokes)
- IdP broker configuration changes
- Key rotation events
- Suspicious activity (failed login attempts, rate limit hits)
- Sensitive data access (viewing user PII, accessing private keys)

**Optional audit (based on volume):**
- User login events (can be high volume)
- Token issuance (use OIDC store queries instead)
- API calls (use application logs instead)

### Sanitization Strategy (CRITICAL)

**Never log:**
- Passwords, client secrets, private keys
- Access tokens, refresh tokens, ID tokens
- Authorization codes, device codes
- Session identifiers (except for correlation)
- Raw PII from IdP responses (store hash for correlation instead)

**Sanitization implementation:**
```typescript
// audit/sanitizer.ts
const SENSITIVE_FIELDS = [
  'password',
  'client_secret',
  'private_jwk',
  'access_token',
  'refresh_token',
  'id_token',
  'authorization_code',
  'device_code',
  'user_code',
  'session_id', // Don't log full session ID
];

const PII_FIELDS = [
  'national_id',
  'ssn',
  'birth_date',
  'raw_claims', // IdP response contains sensitive data
];

export function sanitizeForAudit(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Redact secrets completely
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
    // Hash PII for correlation without storing plaintext
    else if (PII_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = `[HASHED:${hashForCorrelation(value)}]`;
    }
    // Recursively sanitize nested objects
    else if (typeof value === 'object') {
      sanitized[key] = sanitizeForAudit(value);
    }
    else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

function hashForCorrelation(value: string): string {
  // Use first 8 chars of SHA-256 for correlation
  // Not for security, just to correlate audit entries
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 8);
}
```

**Usage:**
```typescript
// Example: Audit client creation
await auditLog.record({
  tenant_id: tenantId,
  actor_sub: session.sub,
  action: 'oauth_client.create',
  resource: `client:${clientId}`,
  message: `Created OAuth client "${clientName}"`,
  before: null,
  after: sanitizeForAudit({
    client_id: clientId,
    client_name: clientName,
    client_secret: generatedSecret, // Will be [REDACTED]
    redirect_uris: redirectUris,
  }),
  ip: req.ip,
  user_agent: req.get('user-agent'),
});
```

### Database Performance

**Critical indexes:**
```sql
-- Tenant-based queries (most common)
CREATE INDEX idx_audit_log_tenant_created ON idem_audit_log(tenant_id, created_at DESC);

-- Actor-based queries (who did what)
CREATE INDEX idx_audit_log_actor ON idem_audit_log(actor_sub);

-- Action-based queries (find all instances of an action)
CREATE INDEX idx_audit_log_action ON idem_audit_log(action);

-- Time-based queries (recent activity)
CREATE INDEX idx_audit_log_created ON idem_audit_log(created_at DESC);
```

**Partitioning strategy (Phase 2):**
```sql
-- Partition by month when > 1M records
CREATE TABLE idem_audit_log_2026_01 PARTITION OF idem_audit_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### Retention Policy

**Compliance requirements:**
- Keep audit logs for minimum 1 year (GDPR, PCI-DSS)
- Archive older logs to cold storage (S3 Glacier, Azure Archive)
- Maintain backup for 7 years for legal compliance

**Implementation:**
```sql
-- Monthly archival job
-- 1. Export logs older than 1 year to S3
-- 2. Delete from primary database
DELETE FROM idem_audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';
```

### GDPR Compliance

**Right to erasure:**
When a user requests data deletion:
1. Anonymize audit logs (replace `actor_sub` with `[DELETED:hash]`)
2. Remove PII from `before`/`after` JSONB
3. Keep audit trail for compliance (action/timestamp/resource)

```typescript
export async function anonymizeUserAuditLog(accountId: string) {
  const hash = hashForCorrelation(accountId);
  
  await db.update(auditLog)
    .set({
      actor_sub: `[DELETED:${hash}]`,
      before: sql`CASE WHEN before IS NOT NULL THEN '{"anonymized": true}'::jsonb ELSE NULL END`,
      after: sql`CASE WHEN after IS NOT NULL THEN '{"anonymized": true}'::jsonb ELSE NULL END`,
    })
    .where(eq(auditLog.actor_sub, accountId));
}
```

## Consequences

### Positive
- Improved compliance posture (GDPR, SOC 2, ISO 27001)
- Easier incident response and debugging
- Immutable audit trail prevents tampering
- Sanitization prevents accidental secret leakage
- GDPR-compliant anonymization strategy

### Negative
- Additional database writes (minimal overhead ~1ms)
- Storage growth requires partitioning and archival
- Sanitization adds complexity to audit code
- JSONB queries can be slow without proper indexes

### Risks and Mitigations
- **Risk:** Audit log grows unbounded
  - **Mitigation:** Partitioning, archival jobs, monitoring
- **Risk:** Sensitive data accidentally logged
  - **Mitigation:** Automated sanitization, code review checklist, integration tests
- **Risk:** Audit log becomes attack vector (log injection)
  - **Mitigation:** Input validation, parameterized queries, no user-controlled fields in `action`

## Testing Strategy

### Automated Tests
```typescript
describe('Audit sanitization', () => {
  it('should redact client secrets', () => {
    const input = { client_id: 'abc', client_secret: 'secret123' };
    const output = sanitizeForAudit(input);
    expect(output.client_secret).toBe('[REDACTED]');
  });
  
  it('should hash PII fields', () => {
    const input = { email: 'user@example.com', national_id: '12345678901' };
    const output = sanitizeForAudit(input);
    expect(output.national_id).toMatch(/^\[HASHED:[a-f0-9]{8}\]$/);
  });
  
  it('should recursively sanitize nested objects', () => {
    const input = { user: { password: 'secret', name: 'John' } };
    const output = sanitizeForAudit(input);
    expect(output.user.password).toBe('[REDACTED]');
    expect(output.user.name).toBe('John');
  });
});
```

### Manual Verification
Before production:
- [ ] Review sample audit entries for sensitive data
- [ ] Verify GDPR anonymization script works correctly
- [ ] Test archival job doesn't delete recent data
- [ ] Verify partitioning strategy scales

## References
- Database model: `docs/database-model.txt` (Section 10)
- GDPR Article 17 (Right to erasure)
- SOC 2 audit logging requirements
- Security hardening baseline: ADR 0014
