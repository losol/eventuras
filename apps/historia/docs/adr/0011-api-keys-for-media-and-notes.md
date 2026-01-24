# ADR 0011: API Keys for Media and Notes Collections

**Status:** Accepted
**Date:** 2026-01-25
**Deciders:** Ole
**Tags:** authentication, api, security, media, notes

## Context

Historia needs to support programmatic access to media and notes collections for:

- **Automated media uploads** from external services (e.g., photo management systems, content pipelines)
- **External service integration** (e.g., third-party applications that need to create/read notes)
- **Batch operations** and content migration tools
- **Headless CMS workflows** where other systems consume and contribute content

Currently, all API access requires user authentication via web sessions or OAuth strategies (e.g., Vipps). This creates friction for programmatic access patterns where:

- Services need to authenticate on behalf of the system rather than a human user
- Long-running automation scripts need stable, non-expiring credentials
- Integration partners need simple, revocable access tokens

### Requirements

1. **Programmatic access** to Media and Notes collections via REST API
2. **Permission inheritance** - API keys should follow the permissions of the user they belong to
3. **Admin-only management** - Only system admins should be able to create/manage API keys
4. **Security** - Keys should be revocable and scoped to individual users

## Decision

We will enable **Payload CMS API Keys** on the Users collection.

### Implementation

1. **Enable API keys on Users collection:**
   ```typescript
   auth: {
     useAPIKey: true,
   }
   ```

2. **Permission model:**
   - API keys inherit permissions from their associated user
   - A user with `site-editor` role gets site-editor permissions via their API key
   - A user with `system-admin` role gets admin permissions via their API key
   - Existing access controls on Media and Notes collections apply automatically

3. **Management:**
   - Only system admins can create/manage API keys (enforced via field-level access control)
   - Field-level access restricts `enableAPIKey`, `apiKey`, and `apiKeyIndex` fields to admins
   - System admins access the "API Keys" tab on user documents in the admin panel
   - Keys can be generated, viewed (once), and deleted
   - Non-admin users (including tenant admins and self-updates) cannot access API key fields

4. **Usage:**
   ```bash
   # Example: Upload media via API key
   curl -X POST https://historia.example.com/api/media \
     -H "Authorization: users API-Key YOUR-API-KEY" \
     -F "file=@photo.jpg" \
     -F "title=My Photo"
   ```

### How It Works

Payload CMS API keys are:
- Stored securely on the user document (hashed)
- Presented once upon creation (like GitHub personal access tokens)
- Validated on each request using `Authorization: users API-Key <key>` header
- Subject to the same access control rules as the user they belong to

## Consequences

### Positive

- **Simple implementation** - Single configuration flag enables API key support
- **Follows existing permissions** - No need to duplicate access control logic
- **Standard Payload pattern** - Uses built-in API key functionality
- **Secure by default** - Keys are hashed, admin-only management, per-user scoping
- **Flexible** - Different users can have keys with different permission levels
- **Auditable** - Each API request is tied to a specific user account

### Negative

- **User account required** - Each API integration needs a dedicated user account
  - *Mitigation:* Create service accounts (e.g., `automation@historia.local`, `media-import@historia.local`)
- **No fine-grained scoping** - Cannot limit a key to specific collections or operations
  - *Mitigation:* Use users with restricted roles (e.g., site-editor can't delete, only admins can)
- **Admin overhead** - System admins must manually create service accounts and keys
  - *Mitigation:* Acceptable given security benefits and infrequent setup

### Alternative Considered: Collection-Level API Keys

We considered adding `auth.useAPIKey` to Media and Notes collections directly, but:
- Would create separate key management per collection (more complexity)
- Harder to audit across collections
- Doesn't align with Payload's recommended pattern (user-based API keys)

### Security Considerations

1. **Admin-only field access:** API key fields (`enableAPIKey`, `apiKey`, `apiKeyIndex`) are restricted to system admins via field-level access control. This prevents:
   - Users from generating API keys for themselves
   - Tenant admins from managing API keys for users in their tenant
   - Any non-admin user from viewing or modifying API key data
2. **Key rotation:** Admins should rotate keys periodically
3. **Service accounts:** Use dedicated user accounts for automation (not personal accounts)
4. **Least privilege:** Assign minimal necessary roles to service accounts
5. **Audit logging:** Monitor API usage through Payload's request logs
6. **HTTPS only:** API keys must only be transmitted over HTTPS in production

## Implementation Notes

### Field-Level Access Control

To enforce system-admin-only API key management, we explicitly define the API key fields with field-level access restrictions:

```typescript
fields: [
  {
    name: 'enableAPIKey',
    type: 'checkbox',
    access: {
      create: adminsFieldLevel,
      read: adminsFieldLevel,
      update: adminsFieldLevel,
    },
    admin: {
      hidden: true, // Managed through API Keys UI tab
    },
  },
  // Similar for 'apiKey' and 'apiKeyIndex' fields
]
```

This is necessary because the Users collection has `updateAndDeleteAccess` that allows:
- System admins (✅ should have access)
- Users updating themselves (❌ should NOT have API key access)
- Tenant admins updating users in their tenant (❌ should NOT have API key access)

By adding field-level access control, only system admins can:
- View the API Keys tab in the admin UI
- Generate API keys for users
- Delete existing API keys
- Access the `enableAPIKey`, `apiKey`, and `apiKeyIndex` fields

### Creating an API Key

1. System admin navigates to Users collection
2. Opens or creates a user document (e.g., service account)
3. Navigates to "API Keys" tab
4. Clicks "Generate API Key"
5. Copies the key (shown only once)
6. Provides key to the integration/service

### Example Service Accounts

- `media-importer@historia.local` - Site editor role, for automated media uploads
- `backup-service@historia.local` - Read-only access via custom role
- `content-sync@historia.local` - Editor role for bi-directional content sync

## References

- [Payload CMS Authentication: API Keys](https://payloadcms.com/docs/authentication/api-keys)
- [Payload CMS Access Control](https://payloadcms.com/docs/access-control/overview)
- ADR 0001: Site Editor Role
- ADR 0002: Verified User Fields

## Related Collections

- `users` - Stores API keys and manages authentication
- `media` - Accessible via API keys (follows user permissions)
- `notes` - Accessible via API keys (follows user permissions)

## Future Considerations

If more granular control is needed in the future, we could:
1. Add custom middleware to validate API key scopes
2. Implement collection-level or operation-level permissions on user documents
3. Create a dedicated API Keys collection with custom access control
4. Use JWT tokens with custom claims for advanced use cases
