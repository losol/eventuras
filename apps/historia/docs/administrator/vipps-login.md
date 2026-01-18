# Vipps Login and User Accounts

> This guide explains how Vipps Login authentication creates and updates user accounts in Historia CMS.

## Overview

**Vipps Login** allows users to authenticate using their Vipps/MobilePay account instead of email and password. When users log in with Vipps, Historia receives verified personal information directly from the Norwegian national registry (Folkeregisteret), creating or updating their user profile with authoritative data.

**Who should read this:**
- User administrators managing user accounts and permissions
- Support staff helping users with login and profile issues
- System administrators responsible for authentication and user data

**Key difference from Vipps Commerce:**
- **Vipps Login:** Authentication-focused, no payment required, instant profile update
- **Vipps Commerce:** Payment-focused, updates profile during checkout (see [Vipps Commerce Guide](vipps-commerce.md))

## How It Works

### Login Flow with Profile Creation

1. **User clicks "Logg inn med Vipps"** on `/admin` login page
2. **Redirected to Vipps** for authentication
3. **User logs in** using Vipps/MobilePay app
4. **Vipps requests consent** to share personal information with Historia
5. **User approves** data sharing
6. **Vipps sends user data** to Historia via OpenID Connect
7. **Historia creates or updates user profile** with verified data
8. **User is redirected** back to Historia and logged in
9. **Verification flags are set** to `true` for verified fields
10. **Business event is created** for audit trail

**This happens automatically** every time a user logs in via Vipps – no manual intervention needed.

### User Matching and Account Creation

When Vipps sends user data, Historia determines whether to create a new account or update an existing one:

#### Existing User (Email Match)

**Scenario:** User with `kari@example.no` already exists in Historia.

**Process:**
1. Vipps provides email: `kari@example.no`
2. Historia finds existing user by email
3. User profile is **updated** with latest Vipps data
4. User is **logged in** to their existing account
5. Verification flags are set to `true`

**Result:** Existing account updated, no duplicate created.

#### New User (No Email Match)

**Scenario:** User with `new@example.no` does not exist in Historia.

**Process:**
1. Vipps provides email: `new@example.no`
2. Historia finds no matching user
3. New user account is **created** with Vipps data
4. User is **logged in** to their new account
5. All Vipps-provided fields marked as verified
6. User gets default role: `user`
7. **Tenant access must be assigned manually** (see Administrator Tasks)

**Result:** New user account created with verified data.

#### Why Email-Based Matching?

- Email has a **unique constraint** in the database (no duplicates possible)
- Email is the **primary authentication identifier**
- **Simple and deterministic** – no ambiguity
- Phone numbers are NOT used because they can be shared or reassigned

**Technical details:** See [ADR 0004 - Trusted Identity Providers](../adr/0004-trusted-identity-providers.md)

## User Data Updates

### Which Fields Are Updated

Every Vipps Login updates these user fields:

| Field | Description | Verified? | Editable After Verification? |
|-------|-------------|-----------|------------------------------|
| `given_name` | First name from Folkeregisteret | ✅ Yes | ❌ No (system-admin only) |
| `middle_name` | Middle name (if any) | ✅ Yes | ❌ No (system-admin only) |
| `family_name` | Last name from Folkeregisteret | ✅ Yes | ❌ No (system-admin only) |
| `email` | Email address from Vipps | ✅ Yes | ❌ No (system-admin only) |
| `phone_number` | Mobile phone number | ✅ Yes | ❌ No (system-admin only) |
| `addresses` | Addresses from Vipps | ❌ No* | ✅ Yes |

\* *Addresses are merged with existing addresses, not marked as verified*

### Data Authority

**Vipps data always overwrites existing data:**

- If user manually entered "John" but Folkeregisteret shows "Jonathan", the profile updates to "Jonathan"
- Previous self-reported data is lost (no version history in user profile)
- This is **intentional** – Folkeregisteret is the authoritative source for Norwegian personal data

**Example:**

**Before Vipps Login:**
```
given_name: "John"  (self-reported, name_verified: false)
email: "john@example.no"  (self-reported, email_verified: false)
```

**After Vipps Login:**
```
given_name: "Jonathan"  (from Folkeregisteret, name_verified: true)
email: "jonathan@example.no"  (from Vipps, email_verified: true)
```

**Rationale:** Ensuring data accuracy and legal compliance. Self-reported data is unreliable compared to registry data.

## Verified Fields vs Self-Reported Fields

### What "Verified" Means

A **verified field** has three guarantees:

1. **Authoritative source:** Data from Folkeregisteret (via Vipps)
2. **Legal accuracy:** Matches official government records
3. **Protected:** Cannot be edited by users or regular admins

**Visual indicator:** Verified fields show a lock icon in the admin UI for non-system-admins.

### Verification Flags

Three boolean flags track verification status:

| Flag | Covers | Set When |
|------|--------|----------|
| `name_verified` | `given_name`, `middle_name`, `family_name` | Vipps Login OR Vipps payment |
| `email_verified` | `email` | Vipps Login OR Vipps payment |
| `phone_number_verified` | `phone_number` | Vipps Login OR Vipps payment |

**Important:** Name fields are treated as an **atomic unit**. You cannot verify or edit individual name components – all three name fields are handled together.

### What Users Can and Cannot Edit

#### Verified Data (Read-Only for Users)

**Fields locked when verified:**
- Name (all three components)
- Email address
- Phone number

**What users see:**
- Fields appear disabled/grayed out
- Tooltip or message: "This field is verified and cannot be edited"
- Users cannot type or change the value

**How to update:**
- Log in via Vipps again to refresh data
- OR contact support for manual override (system-admin only)

#### Self-Reported Data (Editable)

**Fields that remain editable:**
- Addresses (always editable, never verified via Vipps Login)
- Profile picture
- Preferences and settings
- Any custom fields not provided by Vipps

**What users see:**
- Normal input fields
- Can edit and save changes
- No verification lock icon

## Administrator Tasks

### Viewing Verified Users

To identify users with verified data:

#### In Users Collection

1. Navigate to **Users** collection in Payload
2. Open any user document
3. Check **sidebar** for verification flags:
   - `name_verified` ✅
   - `email_verified` ✅
   - `phone_number_verified` ✅
4. If all three are checked, user has fully verified profile from Vipps

#### Filtering Verified Users

**Find all users with verified names:**

1. In Users collection, click **Filters**
2. Add filter: `name_verified` equals `true`
3. Apply filter

**Find all users with ANY verified data:**

Use filters for `name_verified`, `email_verified`, or `phone_number_verified`.

**Tip:** Create saved filters for common queries like "All Verified Users" or "Unverified Users Needing Attention".

### Assigning Tenant Access to New Vipps Users

**Why this is needed:**

When users log in via Vipps for the first time, a new user account is created with:
- Default role: `user`
- **NO tenant/website access** (security by default)

Until tenant access is assigned, users cannot:
- Access content specific to a tenant
- Perform actions within a tenant context
- See tenant-specific data

**How to assign access:**

1. Navigate to **Users** collection
2. Find the user (filter by recent `createdAt` or search by email)
3. Open the user document
4. Scroll to **Tenants** section in the sidebar
5. Click **Add Item**
6. Select the appropriate **tenant** (website/organization)
7. Select the appropriate **role**:
   - `site-member` — Basic access, can view content
   - `site-admin` — Full admin access within the tenant
8. Click **Save**

**Example use case:**

User "Kari Nordmann" logs in via Vipps for the first time to register for a conference. As an admin, you:

1. See new user `kari.nordmann@example.no` in Users collection
2. Open the user document
3. Add tenant access: `Tenant: EventurasConference`, `Role: site-member`
4. Save
5. Now Kari can register for events under that tenant

### Handling User Requests

#### Scenario 1: User Cannot Log In After Email Change

**Situation:**
- User changed email address in their Vipps account
- Now cannot log in to Historia with old email
- Claims they're locked out of their account

**Explanation:**
- User matching uses email as the primary key
- Changed email in Vipps = no match to old account
- Vipps Login creates a **new account** with the new email
- Result: User has two accounts (old and new)

**Resolution:**

**Option A: Merge Accounts (System-admin only)**

1. Identify both accounts:
   - Old account: `old@example.no`
   - New account: `new@example.no` (created from Vipps)
2. Copy tenant access from old account to new account
3. Copy any orders, registrations, or data to new account
4. Archive or delete old account
5. Notify user to use new email going forward

**Option B: Use Old Account**

1. User logs in with **email/password** if they have credentials
2. System-admin manually adds new email to old account
3. Unset `email_verified` flag to allow editing
4. User can continue using old account

**Prevention:**
- Educate users to update email in Historia first, then in Vipps
- OR accept that email changes create new accounts (by design)

#### Scenario 2: User's Name Is Locked and They Can't Edit It

**Situation:**
- User wants to update their name (e.g., nickname, preferred name)
- Name fields are disabled/locked
- Error: "This field is verified and cannot be edited"

**Explanation:**
- Name is verified from Vipps Login (`name_verified = true`)
- Verified data is protected from editing (see [ADR 0003](../adr/0003-user-field-access-control.md))
- Only system-admin can modify verified fields

**Resolution:**

**If legal name actually changed:**
1. User must update name in Folkeregisteret first (official name change)
2. Then log in via Vipps to refresh verified data
3. Profile will automatically update with new legal name

**If user wants to use preferred name/nickname:**
1. Explain that verified name must match legal name for compliance
2. Consider adding a separate "preferred_name" or "display_name" field (feature request)
3. OR system-admin can unset `name_verified` flag (see Manual Override)

#### Scenario 3: User Wants to Use Different Phone Number

**Situation:**
- User's phone number is verified from Vipps
- User wants to use a different number in Historia
- Phone field is locked

**Resolution:**

**Option A (Recommended):**
1. Explain that verified phone number ensures accurate contact info
2. Ask user to update phone in Vipps/MobilePay app first
3. Then log in via Vipps again to refresh the number

**Option B (System-admin override):**
1. System-admin unsets `phone_number_verified` flag
2. User can now edit phone number
3. Phone is no longer verified (self-reported)
4. User should re-verify via Vipps when convenient

**Important:** Unverified phone numbers may have delivery issues for SMS notifications or two-factor authentication.

### Manual Verification/Override

**⚠️ System Admin Only**

Only users with `system-admin` role can:
- Change verification flags (`name_verified`, `email_verified`, `phone_number_verified`)
- Edit verified data directly

#### Unsetting a Verification Flag

**Use case:** User needs to update verified data but cannot re-authenticate via Vipps.

**Steps:**

1. Navigate to **Users** collection
2. Open the user document
3. Scroll to **sidebar** verification flags
4. **Uncheck** the appropriate flag:
   - `name_verified`
   - `email_verified`
   - `phone_number_verified`
5. **Save** the user document
6. User can now edit the previously locked field
7. **Document the reason** (create a business event or add user note)

**Example reason:**
```
User legally changed name but cannot log in via Vipps to re-verify (technical issue). Verification flag unset to allow manual update. User instructed to re-verify when possible.
```

#### Editing Verified Data Directly

**Use case:** Exceptional circumstances requiring immediate correction.

**Steps:**

1. Navigate to **Users** collection
2. Open the user document
3. As system-admin, verified fields are **editable** (not locked)
4. Update the field(s) directly
5. **Decide on verification flag:**
   - Keep as `true` if data is still trustworthy
   - Set to `false` if source is no longer authoritative
6. **Save** the user document
7. **Document the change** (create business event or note)

**Important:** Always explain WHY you manually changed verified data. This maintains audit integrity.

#### Setting a Verification Flag Manually

**Use case:** Admin manually verified data through another trusted process (e.g., physical ID verification).

**Steps:**

1. Update user's name/email/phone with verified data
2. Set the appropriate verification flag to `true`
3. **Create a business event** to document the manual verification:

```json
{
  "type": "user.verified.manual",
  "source": "system-admin",
  "userId": "user-id-here",
  "metadata": {
    "verified_fields": ["name"],
    "verification_method": "Physical ID verification during event check-in",
    "admin_user": "admin@eventuras.com",
    "verified_at": "2026-01-18T10:00:00Z"
  }
}
```

**Rationale:** Manual verification should be rare but documented. Business events provide the audit trail.

## Re-verification Process

### Why Re-verification Matters

User data can become stale:
- Legal name changes (marriage, legal process)
- Email address changes
- Phone number changes
- Address updates

**Re-verification ensures** Historia always has current, authoritative data.

### How to Re-verify

**Method 1: Log in via Vipps Again (Recommended)**

1. User logs out of Historia
2. User navigates to `/admin`
3. User clicks **"Logg inn med Vipps"**
4. User authenticates via Vipps/MobilePay
5. Profile is automatically updated with latest data
6. Verification flags refreshed

**This is the easiest method** and requires no admin intervention.

**Method 2: Make a Vipps Purchase**

If Vipps Commerce is enabled, any Vipps payment will also update and verify user data (see [Vipps Commerce Guide](vipps-commerce.md)).

**Method 3: Manual Verification (System-admin)**

As a last resort, system-admin can manually verify and update data. This should be documented via business events.

### Encouraging Users to Re-verify

**Best practices:**

- Send reminder emails to users with old verification timestamps
- Display notice in user profile: "Your data was last verified on [date]. Please log in via Vipps to refresh."
- Require re-verification before critical actions (e.g., large orders, document signing)

**Implementation:** This requires custom logic in Historia (feature request).

## Business Events

### Tracking Login Verification Events

Every Vipps Login creates a **Business Event**:

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
  "createdAt": "2026-01-18T14:30:00Z"
}
```

### Viewing Login History

To see when and how users were verified:

1. Navigate to **Business Events** collection
2. Filter by `type: user.verified`
3. Further filter by `source: vipps` (distinguishes login from payment)
4. Check `userId` to see events for a specific user

**Use cases:**
- **Audit trail:** Prove when data was verified
- **Debugging:** Investigate login issues or data discrepancies
- **Compliance:** Demonstrate GDPR compliance for data sources
- **User support:** Verify when a user last logged in via Vipps

### Documenting Manual Changes

When system-admins manually change verified data or flags, **create a business event**:

**Steps:**

1. Navigate to **Business Events** collection
2. Click **Create New**
3. Fill in:
   - **Type:** `user.verified.override` or `user.unverified`
   - **Source:** `system-admin`
   - **User ID:** The affected user
   - **Metadata:**

```json
{
  "action": "unset_verification_flag",
  "field": "name_verified",
  "reason": "User legally changed name. Cannot authenticate via Vipps due to technical issue. Manual update allowed.",
  "admin_user": "admin@eventuras.com",
  "previous_value": true,
  "new_value": false
}
```

**Why this matters:**
- Creates audit trail for compliance
- Explains rationale for future administrators
- Tracks who made the change and when
- Can be reviewed during security audits

## Troubleshooting

### Issue: User Cannot Log In with Vipps

**Symptoms:**
- User clicks "Logg inn med Vipps"
- Redirected to Vipps but authentication fails
- Error message or redirect loop

**Diagnostic steps:**

1. **Check Vipps configuration:**
   - Verify `VIPPS_CLIENT_ID` and `VIPPS_CLIENT_SECRET` in `.env`
   - Ensure redirect URI matches Vipps Developer Portal settings
   - Confirm Vipps Login API is enabled in portal

2. **Check logs:**
   - Application logs for `/api/auth/vipps/callback` errors
   - Vipps Developer Portal logs for failed authentication attempts

3. **Test with different user:**
   - If one user fails but others succeed, issue is user-specific
   - Check if user's Vipps account is active

**Common causes:**
- Incorrect redirect URI configuration
- Vipps client secret expired or incorrect
- User's Vipps account suspended
- Network/firewall blocking Vipps API

**Resolution:**
- Fix configuration issues in `.env` and Vipps Developer Portal
- See [Vipps Login Setup Guide](../VIPPS_LOGIN_SETUP.md) for complete setup instructions

### Issue: User Data Not Updating After Login

**Symptoms:**
- User logs in via Vipps successfully
- Profile shows old/incorrect data
- Verification flags not set to `true`

**Diagnostic steps:**

1. **Check Business Events:**
   - Filter for `type: user.verified` and recent timestamps
   - If no event, verification did not occur

2. **Check Vipps data mapping:**
   - Verify `mapVippsUser` function in `apps/historia/src/plugins.ts`
   - Ensure all fields are mapped correctly

3. **Check application logs:**
   - Look for errors during user update
   - Check for database constraint violations

**Common causes:**
- `mapVippsUser` function not returning verification flags
- Database update failed (permissions, constraints)
- Vipps not providing expected fields (check payload from Vipps)

**Resolution:**
- Review and fix `mapVippsUser` configuration
- Check database logs for errors
- Manually trigger update if needed (system-admin)

### Issue: Duplicate Accounts Created

**Symptoms:**
- User has two accounts with different emails
- Old account and new account after email change

**Explanation:**
- This is **expected behavior** (see [ADR 0004](../adr/0004-trusted-identity-providers.md))
- Email matching strategy creates new account if email changed in Vipps

**Resolution (System-admin only):**

1. **Identify both accounts:**
   - Old: `old@example.no`
   - New: `new@example.no`

2. **Merge data:**
   - Copy tenant access from old to new
   - Copy orders, registrations, custom data
   - Update foreign keys if necessary

3. **Archive old account:**
   - Set `deleted: true` (soft delete)
   - OR hard delete if no longer needed

4. **Notify user:**
   - Explain they should use new email going forward
   - Verified data is now accurate

**Prevention:**
- Cannot prevent this with current architecture
- Educate users about email change implications

### Issue: Verified Fields Locked But User Needs to Edit

**Symptoms:**
- User's legitimate data is incorrect in Vipps/Folkeregisteret
- User cannot edit verified fields
- Stuck in "locked" state

**Resolution:**

**Short-term (System-admin override):**
1. Unset verification flag (`name_verified`, `email_verified`, etc.)
2. User can now edit the field
3. Document reason for override

**Long-term (Proper fix):**
1. User must correct data in Vipps/Folkeregisteret/mobile carrier
2. Then log in via Vipps again
3. Data will be refreshed with correct values

**Example:**

User's legal name is "Kari" but Folkeregisteret shows "Karina" due to registry error.

1. User contacts Folkeregisteret to correct the error
2. Once fixed, user logs in via Vipps
3. Profile updates to "Kari" (correct name)
4. Verification flag remains `true`

## Related Documentation

### Technical Details
- [ADR 0002 - Verified User Fields](../adr/0002-verified-user-fields.md) — Technical specification for verification flags
- [ADR 0003 - User Field Access Control](../adr/0003-user-field-access-control.md) — Permission model for verified data
- [ADR 0004 - Trusted Identity Providers](../adr/0004-trusted-identity-providers.md) — User matching and update logic

### Vipps Setup and Integration
- [Vipps Login Setup Guide](../VIPPS_LOGIN_SETUP.md) — How to configure Vipps Login authentication
- [Vipps Commerce Guide](vipps-commerce.md) — How Vipps payments update user data

### Payload CMS Documentation
- [Authentication Strategies](https://payloadcms.com/docs/authentication/overview) — Understanding Payload auth
- [Business Events Collection](https://payloadcms.com/docs/admin/collections) — Audit trail and event logging
- [Field-level Access Control](https://payloadcms.com/docs/access-control/fields) — How permissions work

### User Management
- [Role-Based Access Control](role-based-access-control.md) — Understanding roles and permissions in Historia

## Support Contacts

For technical issues with Vipps Login:
- **Vipps Support:** [Vipps Developer Support](https://developer.vippsmobilepay.com/)
- **Historia Issues:** [GitHub Issues](https://github.com/losol/eventuras/issues)

For questions about this guide:
- Contact your system administrator
- See [Contributing Guide](../../CONTRIBUTING.md) to propose documentation improvements
