# ADR 0019 — Account Registration and Email Verification

## Status

Draft

## Context

Idem needs to support user registration and email verification. Key questions:

1. **How do users register?** OTP via email or via external IdPs?
2. **Do we verify emails?** And if so, when - before or after account creation?
3. **What about external IdPs?** Do we trust email claims from Google, Microsoft, etc.?
4. **How do we store pending registrations?** Database, Redis/Valkey, or in-memory?

### Requirements

- Secure email verification to prevent account takeover
- Good UX (minimal friction for legitimate users)
- Protection against enumeration attacks
- Rate limiting to prevent abuse
- Passwordless authentication only (OTP or external IdP)

## Decision

*To be decided*

### Registration Flow: OTP Before Account Creation

```text
1. User enters email
2. System sends OTP to email
3. User enters OTP
4. Account created with verified email
5. Session started
```

**Pros:**
- No unverified accounts in database
- Cleaner data model
- Email is always verified

**Cons:**
- Requires temporary storage for pending registrations
- User loses progress if OTP expires

### Login Flow: Returning Users

```text
1. User enters email
2. System sends OTP to email
3. User enters OTP
4. Session started
```

Same flow for both registration and login - system creates account if it doesn't exist.

## External IdP Trust Levels

| IdP | Trust email_verified claim? | Rationale |
|-----|----------------------------|-----------|
| Google | ✅ Yes | Google verifies emails |
| Microsoft | ✅ Yes | Microsoft verifies emails |
| GitHub | ⚠️ Partial | Primary email is verified, others may not be |
| Generic OIDC | ❌ No | Cannot assume verification |

**Proposal:** Trust `email_verified=true` claim from known IdPs (Google, Microsoft). For others, require our own verification.

## Pending Registration Storage

### Option 1: Database Table

```sql
CREATE TABLE idem.pending_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  otp_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX pending_ver_email_idx ON idem.pending_verifications(email);
CREATE INDEX pending_ver_expires_idx ON idem.pending_verifications(expires_at);
```

**Pros:** Persistent, survives restarts
**Cons:** Need cleanup job

### Option 2: Redis/Valkey

```text
Key: pending:verification:{email}
Value: { otp_hash, attempts }
TTL: 10 minutes
```

**Pros:** Auto-expiry, fast
**Cons:** Additional infrastructure dependency

### Option 3: Signed Token (Stateless)

```text
1. Generate OTP, send to email
2. Return signed token containing: email, otp_hash, expires_at
3. User submits OTP + token
4. Verify signature and OTP
```

**Pros:** No storage needed
**Cons:** Token must be stored client-side, larger payloads

## OTP Specification

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Length | 6 digits | Balance of security and usability |
| TTL | 10 minutes | Enough time to check email |
| Max attempts | 3 | Prevent brute force |
| Rate limit | 3 OTPs per email per hour | Prevent spam |
| Cooldown | 60 seconds between resends | Prevent rapid resends |

## Security Considerations

- **Enumeration protection**: Same response whether email exists or not
- **Timing attacks**: Constant-time comparison for OTP
- **Rate limiting**: Per-email and per-IP limits
- **OTP storage**: Store hashed, not plaintext
- **Logging**: Log attempts but not OTP values

## Open Questions

1. Do we need Valkey/Redis, or is database sufficient for MVP?
2. How do we handle email change for existing accounts?

## Consequences

### Positive

*To be filled after decision*

### Negative

*To be filled after decision*

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- ADR 0018: Per-Client RBAC (role assignment after registration)
