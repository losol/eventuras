# ADR 0004 — Trusted Identity Providers

## Status
Proposed

## Context

Historia integrates with external identity providers for authentication and verified user data. Currently, **Vipps** is our primary trusted identity provider, providing:

- Authentication via Vipps Login (OpenID Connect)
- Verified personal data from Folkeregisteret (Norwegian national registry)
- Payment processing with user identification

When users interact with Vipps, we receive authoritative data that should override any self-reported data in our system. However, we need clear rules for:

1. **User matching** — How to find existing users when Vipps data arrives
2. **Data conflicts** — What to do when Vipps data differs from existing data
3. **Verification updates** — When to set/update verification flags
4. **Data authority** — Which source takes precedence

**Current Challenges:**

- Users may have manually entered name/email/phone before using Vipps
- Email addresses can be reused across different Vipps accounts (theoretically)
- Phone numbers can change or be reassigned
- We need a deterministic matching strategy to avoid creating duplicate users

## Decision

### Vipps as Trusted Source

**Vipps is a trusted identity provider** with the highest data authority. When we receive data from Vipps, we:

1. ✅ **Always trust Vipps data** as authoritative
2. ✅ **Override existing data** with Vipps data when they conflict
3. ✅ **Set verification flags** to `true` for Vipps-provided fields
4. ✅ **Update on every interaction** (login, payment webhook)

### User Matching Strategy

When receiving Vipps data, find existing users by **email address only**:

#### Match by Email (Primary Key)

```typescript
if (vippsData.email) {
  const existingUser = await payload.find({
    collection: 'users',
    where: {
      email: { equals: vippsData.email },
    },
    limit: 1,
  });

  if (existingUser.docs.length > 0) {
    return existingUser.docs[0];  // MATCH FOUND
  }
}

// No match — create new user
return null;
```

**Rationale:**
- Email is `unique` constraint in Users collection — guaranteed no duplicates
- Email is the primary authentication identifier
- Simple, deterministic, and safe matching
- Avoids phone number conflicts (multiple users could have same unverified phone)

**Why NOT match by phone number:**
- Phone numbers are NOT unique in the database
- Users may manually enter the same phone number
- Phone numbers can be reassigned over time
- Matching by phone could update the wrong user

#### No Match — Create New User

If email doesn't match any existing user, create a new user with all Vipps data marked as verified.

### Data Update Rules

When a matching user is found, update with Vipps data:

```typescript
await payload.update({
  collection: 'users',
  id: matchedUser.id,
  data: {
    // Always update ALL name fields together (atomic unit)
    given_name: vippsData.given_name,
    middle_name: vippsData.middle_name || null,
    family_name: vippsData.family_name,
    name_verified: true,

    // Always update email
    email: vippsData.email,
    email_verified: true,

    // Always update phone
    phone_number: vippsData.phone_number,
    phone_number_verified: true,

    // Merge addresses (don't overwrite all addresses)
    addresses: mergeAddresses(matchedUser.addresses, vippsData.addresses),
  },
  overrideAccess: true,  // Bypass field-level access control
});
```

**Key Principles:**
- ✅ **Always overwrite** name, email, phone with Vipps data
- ✅ **Always set** verification flags to `true`
- ✅ **Merge** arrays like addresses (don't replace entirely)
- ✅ **Use `overrideAccess`** to bypass field-level access control (ADR 0003)
- ✅ **Create business event** to record the verification (REQUIRED for source tracking and audit trail)

### Integration Points

Vipps data updates occur at:

#### 1. Vipps Login (Initial Authentication)

**Plugin:** `@eventuras/payload-vipps-auth`
**File:** `apps/historia/src/plugins.ts`

```typescript
mapVippsUser: (vippsUser) => ({
  email: vippsUser.email,
  email_verified: vippsUser.email_verified,
  given_name: vippsUser.given_name,
  family_name: vippsUser.family_name,
  phone_number: vippsUser.phone_number,
  phone_number_verified: vippsUser.phone_number_verified,
  name_verified: true,  // ADD THIS
  // ... addresses mapping
})
```

The plugin handles user creation and updates automatically.

#### 2. Vipps Payment Webhooks

**File:** `apps/historia/src/app/api/webhooks/vipps/route.ts`

When receiving `AUTHORIZED` or `CAPTURED` events:

```typescript
// 1. Fetch full payment details from Vipps API
const paymentDetails = await getPaymentDetails(vippsConfig, reference);

// 2. Find user using matching strategy
const user = await findUserByVippsData(paymentDetails.userDetails);

// 3. Update user with Vipps data
if (user) {
  await updateUserFromVipps(user.id, paymentDetails.userDetails);
}
```

This ensures that every Vipps purchase updates the user's verified data.

### Edge Cases and Conflicts

#### Case 1: User Changes Phone Number

**Scenario:** User's phone number in Folkeregisteret changes.

**Resolution:**
1. Next Vipps interaction matches by email
2. Updates phone number to new value from Vipps
3. Old phone number is overwritten
4. Phone verification flag updated to `true`

**Result:** Seamless update, no duplicate users created.

#### Case 2: User Changes Email Address

**Scenario:** User's email in Vipps/Folkeregisteret changes.

**Resolution:**
1. Vipps provides new email address
2. No match found on new email (old account exists with old email)
3. New user account is created with new email
4. Result: User has two accounts (old and new)

**Mitigation:**
- Email changes in Folkeregisteret are rare
- System admin can manually merge accounts if needed
- Business events provide audit trail for investigation

#### Case 3: Unverified Data Exists

**Scenario:** User manually entered name before using Vipps.

**Resolution:**
1. Vipps data overwrites manual data
2. Verification flags set to `true`
3. User can no longer edit (see ADR 0003)

**Expected behavior** — this is intentional.

### Future Trusted Providers

This architecture supports additional trusted identity providers:

- **BankID** — Norwegian e-ID solution
- **ID-porten** — Government identity service
- **European eID** — EU cross-border authentication

Each new provider would:
1. Use the same matching strategy (email → create)
2. Set verification flags to `true`
3. Override existing data

**Provider precedence** (if multiple providers used):
1. Most recent verification wins
2. All trusted providers are considered equally authoritative

## Consequences

### Positive

✅ **Deterministic matching** — Email is unique constraint, guaranteed single match
✅ **Data accuracy** — Always reflects latest Folkeregisteret data
✅ **No duplicate risk** — Email uniqueness prevents duplicate accounts
✅ **Automatic updates** — User data stays fresh with each Vipps interaction
✅ **Simple logic** — Single-step email matching is easy to understand and maintain
✅ **Extensible** — Can add more trusted providers with same pattern

### Negative

❌ **Data overwrites** — Manual user data is lost when Vipps data arrives
❌ **Email change duplicates** — If user changes email in Folkeregisteret, creates new account
❌ **No conflict resolution** — No way to preserve manual data alongside verified data
❌ **Manual merging** — Email changes require system admin to merge accounts

### Trade-offs

⚖️ **Trust over flexibility** — We prioritize data accuracy over user control
⚖️ **Simplicity over precision** — Two-step matching is simple but not perfect
⚖️ **Real-time updates** — No manual review, updates happen automatically

## Implementation

### Helper Functions

Create reusable utilities for Vipps user matching and updating:

```typescript
// collections/Users/utilities/vippsUserSync.ts

export async function findUserByVippsData(
  payload: Payload,
  vippsData: VippsUserDetails
): Promise<User | null> {
  // Match by email (primary key)
  if (vippsData.email) {
    const result = await payload.find({
      collection: 'users',
      where: {
        email: { equals: vippsData.email },
      },
      limit: 1,
    });
    if (result.docs.length > 0) return result.docs[0];
  }

  return null;
}

export async function updateUserFromVipps(
  payload: Payload,
  userId: string,
  vippsData: VippsUserDetails
): Promise<void> {
  // Update user data
  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      given_name: vippsData.given_name,
      family_name: vippsData.family_name,
      email: vippsData.email,
      phone_number: vippsData.phone_number,
      name_verified: true,
      email_verified: true,
      phone_number_verified: true,
    },
    overrideAccess: true,
  });

  // Create business event for audit trail
  await payload.create({
    collection: 'business-events',
    data: {
      type: 'user.verified',
      source: 'vipps',
      userId,
      metadata: {
        verified_fields: ['name', 'email', 'phone_number'],
        vipps_data: {
          given_name: vippsData.given_name,
          family_name: vippsData.family_name,
          email: vippsData.email,
          phone_number: vippsData.phone_number,
        },
      },
    },
  });
}
```

### Webhook Integration

Update the Vipps webhook handler:

```typescript
// In route.ts (AUTHORIZED/CAPTURED handler)

if (paymentDetails.userDetails) {
  const user = await findUserByVippsData(payloadInstance, paymentDetails.userDetails);

  if (user) {
    await updateUserFromVipps(payloadInstance, user.id, paymentDetails.userDetails);
    customerId = user.id;
  }
}
```

### Logging and Monitoring

Log all Vipps user updates for audit and debugging:

```typescript
logger.info({
  userId,
  vippsEmail: vippsData.email,
  vippsPhone: vippsData.phone_number,
  action: 'created' | 'updated',
}, 'Synced user from Vipps');
```

## Related

- **ADR 0002** — Verified User Fields (defines verification flags)
- **ADR 0003** — User Field Access Control (restricts editing of verified data)
- **Vipps Login Setup** — `docs/VIPPS_LOGIN_SETUP.md` (authentication configuration)
- **Vipps Webhook** — `docs/VIPPS.md` (payment webhook documentation)

## References

- Vipps Login API: https://developer.vippsmobilepay.com/docs/APIs/login-api/
- Vipps User Info: https://developer.vippsmobilepay.com/docs/APIs/login-api/api-guide/core-concepts/#userinfo-endpoint
