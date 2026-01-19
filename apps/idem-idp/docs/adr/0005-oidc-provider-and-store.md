# ADR 0005 — OIDC Provider and Store

## Status
Accepted

## Context
OIDC flows require durable storage for tokens, sessions, authorization codes, and PAR state.

## Decision
- Use **node-oidc-provider** as the OIDC engine.
- Implement a custom adapter backed by a single table: `idem_oidc_store`.
- Extract common fields (`client_id`, `account_id`, `grant_id`, `session_id`, `scope`, etc.)
  to support revocation, logout fan-out, analytics, and operational queries.

### Database Performance
Critical indexes for OIDC operations:
```sql
-- Primary lookup (required by node-oidc-provider)
CREATE UNIQUE INDEX idx_oidc_store_name_id ON idem_oidc_store(name, id);

-- Grant-based revocation
CREATE INDEX idx_oidc_store_grant ON idem_oidc_store(grant_id) WHERE grant_id IS NOT NULL;

-- Session-based logout fan-out
CREATE INDEX idx_oidc_store_session ON idem_oidc_store(session_id) WHERE session_id IS NOT NULL;

-- User code lookup (device flow)
CREATE INDEX idx_oidc_store_uid ON idem_oidc_store(uid) WHERE uid IS NOT NULL;

-- Token expiration queries
CREATE INDEX idx_oidc_store_expires ON idem_oidc_store(expires_at) WHERE consumed_at IS NULL;
```

### Token Lifecycle Management

**Cleanup Strategy:**
Run daily cleanup job to purge expired tokens:
```sql
DELETE FROM idem_oidc_store 
WHERE expires_at < NOW() - INTERVAL '30 days'
AND consumed_at IS NOT NULL;
```

Keep consumed tokens for 30 days for audit purposes, then purge.

**Payload Size Limits:**
- Enforce maximum payload size of 50KB to prevent abuse
- Token payloads are typically <2KB; large payloads indicate configuration issues
- Monitor payload sizes in production; alert if average exceeds 10KB

**Payload Versioning:**
Version JSONB payloads for forward compatibility:
```json
{
  "v": 1,
  "data": { ... }
}
```

### Security Considerations
- Never log `payload` field (contains tokens and sensitive data)
- Implement `consumed_at` enforcement to prevent replay attacks
- Monitor for abnormal token creation rates (potential attack)
- Use partial indexes to optimize performance without overhead

## Consequences

### Positive
- Full control over token lifecycle and indexing
- Simplified schema compatible with node-oidc-provider adapter API
- Performance optimization through targeted indexes
- Clear token cleanup and audit strategy

### Negative
- JSONB parsing adds minimal latency (~1ms per operation)
- Requires careful index management as schema evolves
- Cleanup jobs add operational complexity

### Risks and Mitigations
- **Risk:** Unbounded table growth
  - **Mitigation:** Daily cleanup job, monitoring, alerts on table size
- **Risk:** Slow queries on expired token lookup
  - **Mitigation:** Partial indexes, regular VACUUM, query optimization
- **Risk:** Large payloads cause performance degradation
  - **Mitigation:** Payload size validation, monitoring, client scope limits

## References
- [node-oidc-provider Adapter API](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#adapter)
- Database model: `docs/database-model.txt` (Section 9)
