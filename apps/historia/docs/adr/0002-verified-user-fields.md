# ADR 0002 — Verified User Fields

## Status
Proposed

## Context

Historia integrates with trusted identity providers. When users authenticate or make purchases via trusted identity providers, we receive verified personal information directly from the Norwegian national registry (Folkeregisteret). Trusted identity providers might send claims which is reasonably assumed to be accurate and authoritative. This data might include:

- Full legal name (given name, middle name, family name)
- Email address
- Phone number

Currently, the User collection has fields for this data, and some verification flags exist (`email_verified`, `phone_number_verified`), but there is no systematic way to:

1. Track whether name data is verified from a trusted source
2. Prevent accidental or unauthorized modification of registry-verified data
3. Distinguish between self-reported data and officially verified data

**Problem:**
Without explicit verification tracking for names, we risk:
- Losing data integrity when verified data is overwritten with self-reported data
- Unable to enforce different validation rules for verified vs. unverified data
- Compliance issues with handling registry-verified personal data
- No audit trail for data source

## Decision

### Add Verification Flag for Name Fields

Extend the User collection with a new boolean field:

```typescript
{
  name: 'name_verified',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Indicates if the user\'s name has been verified by a trusted identity provider',
    position: 'sidebar',
  },
}
```

This field covers all name components:
- `given_name`
- `middle_name`
- `family_name`

**Name as Atomic Unit:**
All three name fields are treated as a single logical unit. When `name_verified=true`, ALL name fields are protected together. You cannot edit `middle_name` independently from `given_name` and `family_name`. This prevents partial name modifications that could break the integrity of verified identity data.

### Existing Verification Fields

The following fields already exist and follow the same pattern:
- `email_verified` — Email verified by trusted source
- `phone_number_verified` — Phone number verified by trusted source

### Field Semantics

**Verified = True** means:
- Data was provided by a trusted identity provider
- Data is considered authoritative (e.g. from Folkeregisteret)
- Data should not be casually modified
- Changes require special permissions (see ADR 0003)

**Verified = False** means:
- Data was self-reported by the user
- Data may require additional validation
- User can modify their own data

### Trusted Sources

Currently, the only trusted identity provider is:
- **Vipps** — Norwegian payment and identity service with Folkeregisteret integration

Future trusted sources may include:
- BankID
- Other OpenID Connect providers with verified claims

## Consequences

### Positive

✅ **Clear data provenance** — We can track whether data came from a trusted source
✅ **Data integrity** — Verified data is protected from accidental modification
✅ **Compliance** — Better handling of registry-verified personal data
✅ **Flexible validation** — Can apply different rules for verified vs. unverified data
✅ **Audit trail** — Verification status AND source stored via business events
✅ **Source tracking** — Business events record which provider verified the data
✅ **Simple model** — Single boolean flag, easy to understand and implement

### Negative

❌ **Additional field** — Increases data model complexity slightly
❌ **Migration required** — Need to set initial values for existing users

### Neutral

⚖️ **No automatic reverification** — If verified data becomes stale, we don't detect it
⚖️ **Trust model assumption** — Assumes all trusted providers are equally authoritative
⚖️ **Atomic name updates** — Cannot edit individual name components when verified; must update all or none

## Implementation

### Database Migration

Set `name_verified = false` for all existing users to maintain backward compatibility.

### Vipps Integration Points

The `name_verified` flag will be set to `true` at:

1. **Vipps Login** (`@eventuras/payload-vipps-auth` plugin)
2. **Vipps Checkout** (when processing payment webhooks)
3. **Manual override** (system-admin only, see ADR 0003)

See **ADR 0004** for the detailed logic of how Vipps data updates users.

### Business Events

**Required:** When setting verification flags to `true`, a business event MUST be created to record the verification:

```typescript
await payload.create({
  collection: 'business-events',
  data: {
    type: 'user.verified',
    source: 'vipps',  // or 'bankid', 'system-admin', etc.
    userId: user.id,
    metadata: {
      verified_fields: ['name', 'email', 'phone_number'],
      previous_values: {
        name_verified: false,
        email_verified: false,
        phone_number_verified: false,
      },
      new_values: {
        name_verified: true,
        email_verified: true,
        phone_number_verified: true,
      },
    },
  },
});
```

**Benefits:**
- **Source tracking** — Know which provider verified the data (Vipps, BankID, etc.)
- **Audit trail** — Full history for compliance and security
- **Change tracking** — See what values changed during verification
- **Debug capability** — Investigate user data issues
- **Analytics** — Track verification sources and success rates

## Related

- **ADR 0003** — User Field Access Control (defines who can modify verified fields)
- **ADR 0004** — Trusted Identity Providers (defines how Vipps updates user data)
- **Administrator Guide** — User Management (practical guide for handling verified users)

## References

- Payload CMS Field Types: https://payloadcms.com/docs/fields/overview
- Vipps Login API: https://developer.vippsmobilepay.com/docs/APIs/login-api/
