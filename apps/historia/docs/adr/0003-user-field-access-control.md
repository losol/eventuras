# ADR 0003 — User Field Access Control

## Status
Proposed

## Context

With the introduction of verified user fields (ADR 0002), we need to ensure that registry-verified data cannot be accidentally or maliciously modified by unauthorized users.

Currently, the User collection has basic access control:
- Users can update their own profile (`isAccessingSelf`)
- Tenant admins can update users in their tenant
- System admins can update any user

This model is too permissive for verified data. If a user's name is verified from Folkeregisteret via Vipps, we must prevent:

1. **Self-modification** — Users changing their own verified name/email/phone
2. **Tenant admin modification** — Admins changing verified data without authority
3. **Accidental overwrites** — API calls or bulk operations modifying verified data

The only legitimate use cases for modifying verified data are:
- **Legal name changes** — Handled through Vipps re-verification, not manual edits
- **Data corrections** — Requires system-level administrative authority

## Decision

### Implement Field-Level Access Control

Use Payload's field-level `access` control to restrict modification of verified fields based on verification status.

### Access Rules

#### 1. Verification Flag Fields

The verification flags themselves are highly restricted:

```typescript
{
  name: 'name_verified',
  type: 'checkbox',
  access: {
    read: () => selfOrAdmin ?,  // Everyone can see if data is verified
    create: isSystemAdmin,  // Only system-admin can set on create
    update: isSystemAdmin,  // Only system-admin can change status
  },
}
```

**Same applies to:**
- `email_verified`
- `phone_number_verified`

#### 2. Protected Data Fields

Name, email, and phone fields are protected when verified:

```typescript
{
  name: 'given_name',
  type: 'text',
  access: {
    read: () => true,  // Everyone can read
    update: ({ req, data }) => {
      if (!req.user || !('email' in req.user)) return false;

      // System admins can always update
      if (isSystemAdmin(req.user)) return true;

      // Others can only update if NOT verified
      return !data?.name_verified;
    },
  },
}
```

**Same pattern applies to:**
- `given_name`, `middle_name`, `family_name` — protected by `name_verified` (treated as atomic unit)
- `email` — protected by `email_verified`
- `phone_number` — protected by `phone_number_verified`

**Note on Name Fields:**
All three name fields (`given_name`, `middle_name`, `family_name`) are treated as a single atomic unit when `name_verified=true`. You cannot edit one name component independently; all must be updated together or none at all.

### Who Can Do What

| User Role | Read Verified Data | Update Verified Data | Change Verification Flag |
|-----------|-------------------|---------------------|-------------------------|
| **Anonymous** | ❌ No | ❌ No | ❌ No |
| **Self (User)** | ✅ Yes | ❌ No | ❌ No |
| **Tenant Admin** | ✅ Yes | ❌ No | ❌ No |
| **System Admin** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Vipps Webhook** | N/A | ✅ Yes* | ✅ Yes* |

\* *Via `overrideAccess: true` in trusted webhook handlers*

### Unverified Data

If verification flags are `false`, normal access rules apply:
- Users can update their own unverified data
- Tenant admins can update users in their tenant
- System admins can update any user

### System Admin Responsibilities

System admins who can modify verified data should:
- **Document reasons** for changes (audit logging)
- **Verify legitimacy** of change requests (name change documents, etc.)
- **Prefer re-verification** via Vipps when possible
- **Only override** in exceptional circumstances

## Consequences

### Positive

✅ **Data integrity** — Verified data cannot be accidentally modified
✅ **Compliance** — Registry data is protected at the database level
✅ **Clear authority** — Only system-level admins can override verified data
✅ **Self-service** — Users can still update unverified data
✅ **Granular control** — Field-level access, not collection-level
✅ **Transparent** — Users can see which fields are verified

### Negative

❌ **Reduced flexibility** — Users cannot correct their own verified data
❌ **Admin burden** — System admin required for legitimate name changes
❌ **Support overhead** — Users may contact support to change verified data
❌ **Edge cases** — Legal name changes require manual intervention

### Mitigations

**For legal name changes:**
- Encourage users to log in via Vipps again to refresh verified data
- Document the re-verification process for users

**For data corrections:**
- System admins can unset verification flag if data is incorrect
- User can then update their own data
- User should re-verify via Vipps when possible

**For edge cases:**
- System admin override remains available
- Audit logging should track all verified data modifications

## Implementation

### Field Access Helper

Create a reusable helper for verified field access:

```typescript
// collections/Users/access/verifiedFieldAccess.ts

export const createVerifiedFieldAccess = (
  verificationFlagName: 'name_verified' | 'email_verified' | 'phone_number_verified'
): FieldAccess => ({
  read: () => true,

  update: ({ req, data }) => {
    if (!req.user || !('email' in req.user)) return false;

    // System admins can always update
    if (isSystemAdmin(req.user)) return true;

    // Others can only update if NOT verified
    return !data?.[verificationFlagName];
  },
});
```

### Usage in User Collection

```typescript
{
  name: 'given_name',
  type: 'text',
  access: createVerifiedFieldAccess('name_verified'),
}
```

### Webhook Overrides

Trusted webhooks (Vipps) must use `overrideAccess: true` when updating verified data:

```typescript
await payload.update({
  collection: 'users',
  id: userId,
  data: {
    given_name: vippsData.given_name,
    name_verified: true,
  },
  overrideAccess: true,  // Bypass field-level access control
});
```

## User Experience

### In Payload Admin UI

- Verified fields show as **disabled** for non-system-admins
- Verification badges/icons indicate verified status
- Tooltips explain why fields are read-only

### In Frontend Profile Pages

- Verified fields are **disabled/read-only**
- Clear messaging: "✓ Verified by Vipps"
- Help text: "This information is verified and cannot be changed manually. Log in via Vipps to update."

## Administrator Guide

A practical guide will be created at `docs/administrator/user-management.md` covering:

- How to identify verified users
- When it's appropriate to override verified data
- How to handle user requests for data changes
- Re-verification process via Vipps
- Audit logging and documentation requirements

## Related

- **ADR 0002** — Verified User Fields (defines the verification flags)
- **ADR 0004** — Trusted Identity Providers (defines how Vipps updates user data)
- **Administrator Guide** — User Management (practical how-to guide)

## References

- Payload CMS Field Access: https://payloadcms.com/docs/access-control/fields
- Payload CMS `overrideAccess`: https://payloadcms.com/docs/access-control/overview#overriding-access-control
