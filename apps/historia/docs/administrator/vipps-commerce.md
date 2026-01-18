# Vipps Commerce and User Data

> This guide explains how Vipps payments automatically update and verify user data in Historia CMS.

## Overview

When customers pay for products using **Vipps Express Checkout**, Historia receives verified personal information from the Norwegian national registry (Folkeregisteret) through Vipps. This data is automatically used to update customer profiles and mark certain fields as "verified" – ensuring data accuracy and compliance with data protection requirements.

**Who should read this:**
- Commerce managers handling orders and customer data
- System administrators responsible for user data integrity
- Support staff assisting customers with account issues

## How It Works

### Payment Flow with User Data

1. **Customer initiates payment** via Vipps Express Checkout
2. **Vipps collects consent** for sharing personal information
3. **Customer completes payment** in Vipps/MobilePay app
4. **Vipps sends webhook** with payment details AND verified user data
5. **Historia receives webhook** at `/api/webhooks/vipps`
6. **User profile is updated** with verified data from Folkeregisteret
7. **Verification flags are set** to `true` for verified fields
8. **Business event is created** for audit trail

**This happens automatically** for every successful Vipps payment (`AUTHORIZED` or `CAPTURED` events).

### Finding the Matching User

Historia matches incoming Vipps data to existing users **by email address only**:

- **Email matches existing user** → Profile is updated with Vipps data
- **Email is new** → New user account is created with all data verified

**Important:** Phone numbers are NOT used for matching because:
- Multiple users could have entered the same unverified phone number
- Phone numbers can be reassigned over time
- Email has a unique constraint in the database

## User Data Updates

### Which Fields Are Updated

When a Vipps payment is processed, these user fields are **automatically updated**:

| Field | Description | Verified? |
|-------|-------------|-----------|
| `given_name` | First name from Folkeregisteret | ✅ Yes |
| `middle_name` | Middle name (if any) | ✅ Yes |
| `family_name` | Last name from Folkeregisteret | ✅ Yes |
| `email` | Email address from Vipps | ✅ Yes |
| `phone_number` | Mobile phone number | ✅ Yes |
| `addresses` | Shipping/billing addresses | ❌ No* |

\* *Addresses are merged with existing addresses, not marked as verified*

### Data Authority

**Vipps data always wins** when there's a conflict:

- If a user manually entered "John Doe" but Folkeregisteret shows "Jonathan Doe", the profile will be updated to "Jonathan Doe"
- If a user's phone number changed in the national registry, the new number overwrites the old one
- Previous self-reported data is lost (no history kept in user profile)

**Rationale:** Folkeregisteret is the authoritative source for Norwegian personal data. Vipps data is considered legally accurate and takes precedence over self-reported information.

## Verified Fields

### What "Verified" Means

A **verified field** in Historia has three characteristics:

1. **Source:** Data came from a trusted identity provider (Vipps)
2. **Authority:** Data originates from Folkeregisteret (official registry)
3. **Protected:** Field cannot be edited by regular users or admins

**Visual indicator:** Verified fields show a lock icon or disabled state in the admin UI for non-system-administrators.

### Verification Flags

Three boolean flags track verification status:

- `name_verified` — Covers given_name, middle_name, and family_name (treated as a single unit)
- `email_verified` — Email address verified
- `phone_number_verified` — Phone number verified

**Note:** Name fields are atomic – you cannot verify individual name components. All three name fields are verified together or not at all.

### Who Can See and Edit

| User Role | Can View Verified Data | Can Edit Verified Data | Can Change Verification Flag |
|-----------|------------------------|------------------------|------------------------------|
| Customer (self) | ✅ Yes | ❌ No | ❌ No |
| Tenant Admin | ✅ Yes | ❌ No | ❌ No |
| System Admin | ✅ Yes | ✅ Yes | ✅ Yes |

**Access control details:** See [ADR 0003 - User Field Access Control](../adr/0003-user-field-access-control.md)

## Administrator Tasks

### Viewing Verified Users

To identify users with verified data in Payload CMS:

1. Navigate to **Users** collection
2. Look for users with these indicators:
   - Lock icon next to name/email/phone fields
   - Verification checkboxes in the sidebar (checked = verified)

**Verification flags location:**
- Open any user document
- Check sidebar for: `name_verified`, `email_verified`, `phone_number_verified`

**Tip:** You can filter users by verification status using the collection filters. For example, filter by `name_verified: true` to find all users with verified names.

### Handling Customer Requests

#### Scenario 1: Customer Got Married and Changed Their Name

**Situation:**
- Customer's legal name changed in Folkeregisteret
- Customer wants their Historia profile to reflect the new name
- Name is currently marked as verified with old name

**Solution:**
1. Ask customer to **make a new Vipps purchase** (even a small amount)
2. Vipps will provide updated name from Folkeregisteret
3. Profile will automatically update with new verified name

**Alternative (system-admin only):**
1. Unset `name_verified` flag to `false` (see Manual Verification Override)
2. User can now edit their own name
3. Ask user to verify again via Vipps when convenient

#### Scenario 2: Customer Wants to Use Different Email Than Vipps

**Situation:**
- Customer's Vipps email is `work@company.no`
- Customer wants to use `personal@gmail.com` for Historia
- Email is currently verified and locked

**Solution:**

**Option A (Recommended):**
1. Customer cannot change verified email
2. Explain that verified email ensures data accuracy for orders and invoicing
3. Suggest customer update their email in Vipps/MobilePay app first
4. Then make a new Vipps purchase to refresh the email

**Option B (System-admin override):**
1. System admin unsets `email_verified` flag (see Manual Verification Override)
2. Customer can update email to `personal@gmail.com`
3. Email is now unverified
4. Customer should re-verify via Vipps Login later

**Warning:** Changing verified email creates a disconnect between Vipps identity and Historia profile. This can cause issues with future Vipps purchases.

#### Scenario 3: Customer Claims Their Phone Number Is Wrong

**Situation:**
- Customer says phone number in profile is incorrect
- Phone number is verified from Vipps
- Customer insists their "real" number is different

**Resolution Steps:**

1. **Verify the source:**
   - Check Business Events for the verification source (should show `source: vipps`)
   - Note the timestamp of when phone was verified

2. **Explain to customer:**
   - Phone number comes directly from their Vipps/MobilePay account
   - Vipps uses data from their mobile carrier and Folkeregisteret
   - If the number is wrong, they must update it in Vipps first

3. **Customer action:**
   - Update phone number in Vipps/MobilePay app
   - Make a new Vipps purchase to refresh the data
   - OR use Vipps Login to re-authenticate (see [Vipps Login Guide](vipps-login.md))

4. **System admin override (last resort):**
   - Only if customer can prove the phone number is incorrect
   - Unset `phone_number_verified` flag
   - Customer can manually update phone number
   - Document the reason for the override in Business Events or user notes

### Manual Verification/Override

**⚠️ System Admin Only**

Only users with `system-admin` role can manually change verification flags or edit verified data.

#### Unsetting a Verification Flag

**Use case:** Customer needs to update verified data, but cannot re-verify via Vipps.

**Steps:**

1. Navigate to **Users** collection in Payload
2. Open the user document
3. Scroll to **sidebar** where verification flags are located:
   - `name_verified`
   - `email_verified`
   - `phone_number_verified`
4. **Uncheck** the appropriate verification flag
5. **Save** the user document
6. User can now edit the previously verified field
7. **Document the reason** (see Business Events section)

**Example:**
```
Reason: Customer legally changed name but cannot make Vipps purchase for re-verification. Name verified flag unset to allow manual update. Customer instructed to re-verify via Vipps Login when possible.
```

#### Editing Verified Data Directly

**Use case:** Exceptional circumstances where immediate correction is needed.

**Steps:**

1. Navigate to **Users** collection
2. Open the user document
3. As system-admin, verified fields are **editable** (not locked)
4. Update the field(s) directly
5. **Keep verification flag as `true`** if data is still trustworthy
6. OR **set flag to `false`** if data source is no longer authoritative
7. **Save** the user document
8. **Create a business event** to document the manual override (see below)

**Important:** Always document WHY you made manual changes to verified data.

## Business Events

### Tracking Verification Events

Every time a user's data is verified from Vipps, a **Business Event** is automatically created:

**Event Type:** `user.verified`

**Event Data:**
```json
{
  "type": "user.verified",
  "source": "vipps",
  "userId": "65f4a3b2c1d0e8f9g0h1i2j3",
  "metadata": {
    "verified_fields": ["name", "email", "phone_number"],
    "vipps_data": {
      "given_name": "Kari",
      "family_name": "Nordmann",
      "email": "kari@example.no",
      "phone_number": "+4798765432"
    }
  },
  "createdAt": "2026-01-15T14:30:00Z"
}
```

### Viewing Verification History

To see when and how a user's data was verified:

1. Navigate to **Business Events** collection
2. Filter by `type: user.verified`
3. Further filter by `userId` to find events for a specific user
4. Events show:
   - Which provider verified the data (`source: vipps`)
   - What fields were verified (`verified_fields`)
   - The actual data received from Vipps (`vipps_data`)
   - Timestamp of verification

**Use cases for Business Events:**
- **Audit trail:** Prove when and how data was verified for compliance
- **Debugging:** Investigate user data issues or customer complaints
- **Analytics:** Track how many users have verified data
- **Compliance:** Demonstrate GDPR compliance for data source tracking

### Documenting Manual Overrides

When system-admins manually change verified data or flags, **create a business event manually**:

1. Navigate to **Business Events** collection
2. Click **Create New**
3. Fill in:
   - **Type:** `user.verified.override` (custom type)
   - **Source:** `system-admin`
   - **User ID:** The affected user
   - **Metadata:** Include reason and details

**Example metadata:**
```json
{
  "action": "unset_verification_flag",
  "field": "name_verified",
  "reason": "Customer legally changed name. Cannot re-verify via Vipps. Instructed to use Vipps Login for re-verification.",
  "admin_user": "admin@eventuras.com",
  "previous_value": true,
  "new_value": false
}
```

## Troubleshooting

### Issue: Verified Data Not Updating After Vipps Payment

**Symptoms:**
- Customer completed Vipps payment
- User profile shows old/incorrect data
- Verification flags not set

**Diagnostic steps:**

1. **Check webhook delivery:**
   - Navigate to Vipps Developer Portal
   - Check webhook logs for `AUTHORIZED` or `CAPTURED` events
   - Verify webhook was sent to Historia

2. **Check Historia webhook handler:**
   - Check application logs for `/api/webhooks/vipps` endpoint
   - Look for errors or warnings
   - Verify user matching succeeded

3. **Check Business Events:**
   - Filter `type: user.verified`
   - Look for recent events matching the payment timestamp
   - If no event exists, verification did not occur

**Common causes:**
- Webhook failed due to network issue
- User matching failed (email mismatch)
- Webhook handler error (check logs)

**Resolution:**
- Retry webhook from Vipps Developer Portal
- OR ask customer to make another small Vipps purchase
- OR manually trigger verification (system-admin only)

### Issue: User Has Duplicate Accounts After Email Change

**Symptoms:**
- User changed email in Vipps/Folkeregisteret
- Made a new Vipps purchase
- Now has two accounts: old email and new email

**Explanation:**
- Matching strategy uses email as primary key
- New email = no match = new account created
- This is expected behavior (see [ADR 0004](../adr/0004-trusted-identity-providers.md))

**Resolution (System-admin only):**

1. **Identify both accounts:**
   - Old account: `olduser@example.no`
   - New account: `newuser@example.no` (verified from Vipps)

2. **Merge account data:**
   - Copy orders, registrations, and data from old account to new account
   - OR update foreign keys to point to new account
   - This is a manual process (no automated merge tool)

3. **Delete or archive old account:**
   - Soft delete: Set `deleted: true` flag (if available)
   - Hard delete: Remove from database (loses history)

4. **Notify customer:**
   - Explain they should use the new email going forward
   - Their verified data is now up-to-date

**Prevention:**
- Educate customers to update email in Historia before changing it in Vipps
- Or use Vipps Login instead of Vipps Checkout for re-verification (see [Vipps Login Guide](vipps-login.md))

### Issue: Customer Cannot Edit Their Own Name

**Symptoms:**
- Customer tries to update their name in profile
- Field appears locked/disabled
- Error message: "You cannot edit verified fields"

**Explanation:**
- Name is verified from Vipps (name_verified = true)
- Verified data is protected from editing (see [ADR 0003](../adr/0003-user-field-access-control.md))
- Only system-admin can edit verified fields

**Resolution:**

**If customer's legal name actually changed:**
1. Ask customer to update name in Folkeregisteret first
2. Then make a new Vipps purchase to refresh data
3. OR use Vipps Login to re-authenticate

**If customer wants to use a nickname/preferred name:**
1. Explain that verified name must match legal name for invoicing/compliance
2. Consider adding a separate "display_name" or "preferred_name" field (not verified)
3. OR system-admin can unset verification flag if appropriate

### Issue: Phone Number Changed But Profile Not Updated

**Symptoms:**
- Customer changed phone number in Vipps/mobile carrier
- Made a Vipps purchase
- Profile still shows old phone number

**Diagnostic steps:**

1. **Check Vipps webhook payload:**
   - Verify webhook included `phone_number` field
   - Vipps might not send phone if not available

2. **Check Business Events:**
   - Look for `user.verified` event
   - Check if `phone_number` was in `verified_fields`

3. **Check user matching:**
   - Verify email matched correctly
   - If new email, might have created new account

**Resolution:**
- Ask customer to verify their phone number is updated in Vipps app
- Try Vipps Login instead of payment (see [Vipps Login Guide](vipps-login.md))
- OR manually update phone number (system-admin only) and unset verification flag

## Related Documentation

### Technical Details
- [ADR 0002 - Verified User Fields](../adr/0002-verified-user-fields.md) — Technical specification for verification flags
- [ADR 0003 - User Field Access Control](../adr/0003-user-field-access-control.md) — Permission model for verified data
- [ADR 0004 - Trusted Identity Providers](../adr/0004-trusted-identity-providers.md) — User matching and update logic

### Vipps Setup and Integration
- [Vipps Payment Integration](../VIPPS.md) — Webhook setup and payment processing
- [Vipps Login Guide](vipps-login.md) — Alternative way to verify user data (authentication instead of payment)

### Payload CMS Documentation
- [Business Events Collection](https://payloadcms.com/docs/admin/collections) — Understanding audit trail
- [Access Control](https://payloadcms.com/docs/access-control/overview) — Field-level permissions

## Support Contacts

For technical issues with Vipps integration:
- **Vipps Support:** [Vipps Developer Support](https://developer.vippsmobilepay.com/)
- **Historia Issues:** [GitHub Issues](https://github.com/losol/eventuras/issues)

For questions about this guide:
- Contact your system administrator
- See [Contributing Guide](../../CONTRIBUTING.md) to propose documentation improvements
