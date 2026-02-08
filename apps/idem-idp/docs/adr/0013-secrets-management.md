# ADR 0013 — Secrets Management and Encryption

## Status
Accepted

## Context
The system handles multiple types of secrets with varying security requirements:
- OAuth client secrets (used to authenticate clients)
- IdP broker client secrets (used to authenticate with upstream providers)
- Private signing keys (JWKS - used to sign tokens)
- Encryption keys (used for application-level encryption)

Database breaches are a realistic threat, and plaintext secrets would compromise the entire system.

## Decision

### Client Secrets (OAuth & IdP)
**Use scrypt hashing** - secrets are never stored in plaintext.

```typescript
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Creating a client
const salt = randomBytes(32);
const derivedKey = await scryptAsync(clientSecret, salt, 64, {
  N: 16384,  // CPU/memory cost (2^14)
  r: 8,      // Block size
  p: 1,      // Parallelization
});
const hashedSecret = `${salt.toString('hex')}:${derivedKey.toString('hex')}`;

await db.insert(oauthClients).values({
  client_id: clientId,
  client_secret: hashedSecret, // Never plaintext
});

// Verifying a client
const [saltHex, hashHex] = storedHash.split(':');
const derivedKey = await scryptAsync(providedSecret, Buffer.from(saltHex, 'hex'), 64, {
  N: 16384, r: 8, p: 1,
});
const match = timingSafeEqual(derivedKey, Buffer.from(hashHex, 'hex'));
```

**Rationale:**
- Client secrets are credentials - same threat model as passwords
- Hashing prevents secret leakage even if database is compromised
- Built into Node.js crypto module - no external dependencies
- Parameters: N=16384 provides ~100ms hashing time

### Private Signing Keys (JWKS)

**Phase 1 (MVP):** Application-level encryption
```typescript
// Encrypt before storing
const encrypted = await encrypt(privateJwk, process.env.MASTER_KEY);
await db.insert(keys).values({
  kid: kid,
  private_jwk: encrypted,
});

// Decrypt when needed
const privateJwk = await decrypt(storedEncrypted, process.env.MASTER_KEY);
```

**Phase 2 (Production):** KMS integration (AWS KMS, Azure Key Vault, or Google Cloud KMS)
```typescript
// Encrypt with KMS
const encrypted = await kms.encrypt(privateJwk, keyId);
await db.insert(keys).values({
  kid: kid,
  private_jwk: encrypted,
});

// Decrypt with KMS
const privateJwk = await kms.decrypt(storedEncrypted, keyId);
```

**Rationale:**
- Private keys are high-value targets (can forge tokens)
- Application-level encryption provides baseline protection for MVP
- KMS provides hardware-backed security, audit trails, and key rotation
- Migration path from app-level to KMS is straightforward

### Environment Variables
- Store master encryption keys in environment variables (MVP)
- Use secret management service in production (AWS Secrets Manager, Azure Key Vault)
- Never commit secrets to version control
- Rotate secrets regularly (quarterly for master keys, annually for KMS keys)

### PII Encryption (Phase 2)
For highly sensitive PII (`national_id`, `raw_claims`):
- Column-level encryption with separate encryption keys per purpose
- Consider pseudonymization for analytics use cases
- Implement GDPR right-to-erasure by key destruction

## Consequences

### Positive
- Database breach does not compromise client secrets (hashed)
- Private keys protected even if database is compromised (encrypted)
- Clear migration path from MVP to production-grade KMS
- Compliance with security best practices and GDPR requirements

### Negative
- Additional complexity in key management
- Performance overhead for encryption/decryption (minimal with caching)
- Dependency on KMS service in production (adds operational complexity)

### Risks and Mitigations
- **Risk:** Loss of master encryption key = data loss
  - **Mitigation:** Backup master key in secure vault (offline), documented recovery procedure
- **Risk:** KMS service outage
  - **Mitigation:** Cache decrypted keys in memory with TTL, circuit breaker pattern
- **Risk:** Improper secret logging
  - **Mitigation:** Audit sanitization (ADR 0011), code review checklist

## Implementation Notes

### Startup Validation
```typescript
// Fail fast if master key is missing
if (process.env.NODE_ENV === 'production' && !process.env.MASTER_KEY) {
  throw new Error('FATAL: MASTER_KEY must be set in production');
}
```

### Never Log Secrets
```typescript
// Logging sanitizer
function sanitize(obj: any) {
  const redacted = { ...obj };
  const secretFields = ['client_secret', 'private_jwk', 'access_token', 'refresh_token'];
  secretFields.forEach(field => {
    if (field in redacted) redacted[field] = '[REDACTED]';
  });
  return redacted;
}

logger.info(sanitize(data));
```

### Key Rotation Strategy
- Private signing keys: Rotate annually or on compromise
- Client secrets: Rotate on demand (client controls)
- Master encryption key: Rotate quarterly with zero-downtime migration
- KMS keys: Use KMS automatic rotation features

## References
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [node-oidc-provider Security Considerations](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#security-considerations)
- NIST SP 800-57: Key Management Recommendations
