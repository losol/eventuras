# ADR 0001 — Site Roles and Access Control

## Status
Accepted

## Context

Historia is a multi-tenant CMS built on Payload CMS, where multiple websites (tenants) are managed within a single installation. Currently, content access control has only two tenant-scoped roles:

- `site-admin` — Full administrative access to a website/tenant
- `site-member` — Basic member access

This binary model is insufficient for real-world CMS workflows where organizations need:
- **Content editors** who can create and update content without full administrative privileges
- **Commerce managers** who can manage products/orders without structural access
- Clear separation between editorial work, e-commerce operations, and structural/configuration changes
- Delegation of specialized responsibilities without granting broad admin privileges

**Current Problem**:
1. Articles, Happenings, and other content collections use the `authenticated` access control, which is too permissive
2. Role field naming is ambiguous - `roles` could refer to global or site-specific roles
3. No way to grant e-commerce permissions without full admin access

## Decision

### Design Philosophy

**Start Simple, Evolve as Needed**

This ADR takes a **direct role-based approach** rather than introducing a permission abstraction layer.

**Why direct role checking:**
- ✅ **Simple to understand** — Role → Collection access is explicit
- ✅ **Less overhead** — No permission mapping layer
- ✅ **Payload CMS natural** — Works with Payload's multi-tenant plugin seamlessly
- ✅ **Sufficient for current needs** — Four roles cover all use cases
- ✅ **Easy to test** — Direct relationship between roles and access

**Future-proof:**
- Can introduce permission layer later if role count grows significantly
- Documented as "Phase 1" enhancement in Future Enhancements section
- Current implementation makes permission-layer addition straightforward

### 1. Rename Tenant Roles Field

Rename `roles` → `siteRoles` in the tenant array field for clarity:

```typescript
// Before (ambiguous)
tenants: [{ tenant: Website, roles: ['site-admin'] }]

// After (clear)
tenants: [{ tenant: Website, siteRoles: ['admin', 'editor'] }]
```

This eliminates confusion between:
- **Global roles** (`user.roles`) — `system-admin` (only)
- **Site roles** (`user.tenants[].siteRoles`) — `admin`, `editor`, `commerce`, `member`

### 2. Introduce Four Site-Scoped Roles

Expand from 2 to 4 site roles with clear responsibilities:

```
Global Roles (user.roles):
  system-admin ← Full system access (super admin)

Site Roles (user.tenants[].siteRoles):
  admin ← Full control of the website/tenant
  editor ← Content creation/editing
  commerce ← Product/order management
  member ← Read-only access (can view drafts)
```

**Important: Roles are additive and combinable**

- Users can have **multiple roles on the same site** (e.g., both `editor` and `commerce`)
- Permissions are **additive** — having multiple roles grants the union of all permissions
- Access control functions **combine tenant IDs** from all relevant roles using OR logic
- Example: User with `['editor', 'commerce']` can both edit articles AND manage products

Example user configuration:
```typescript
{
  email: "sarah@example.com",
  tenants: [
    {
      tenant: "website-a",
      siteRoles: ['admin']  // Full control of website-a
    },
    {
      tenant: "website-b",
      siteRoles: ['editor', 'commerce']  // Content + commerce on website-b
    },
    {
      tenant: "website-c",
      siteRoles: ['member']  // Read-only on website-c
    }
  ]
}
```

### 3. Site Role Permissions Matrix

| Collection | member | editor | commerce | admin | system admin |
|------------|--------|--------|----------|-------|--------------|
| **Content Collections** |
| Articles | Read published | ✅ Create/Update<br>❌ Delete | Read published | ✅ Full access | ✅ Full access |
| Happenings | Read published | ✅ Create/Update<br>❌ Delete | Read published | ✅ Full access | ✅ Full access |
| Notes | Read published | ✅ Create/Update<br>❌ Delete | Read published | ✅ Full access | ✅ Full access |
| Projects | Read published | ✅ Create/Update<br>❌ Delete | Read published | ✅ Full access | ✅ Full access |
| Pages | Read published | ✅ Create/Update<br>❌ Delete | Read published | ✅ Full access | ✅ Full access |
| Media | Read | ✅ Create/Update<br>❌ Delete | Read | ✅ Full access | ✅ Full access |
| **E-commerce Collections** |
| Products | Read published | Read published | ✅ Create/Update<br>❌ Delete | ✅ Full access | ✅ Full access |
| Carts | Own cart only | Own cart only | Read all | ✅ Full access | ✅ Full access |
| Orders | Own orders only | Own orders only | ✅ Read/Update all<br>❌ Delete | ✅ Full access | ✅ Full access |
| Shipments | Own shipments | Own shipments | ✅ Create/Update<br>❌ Delete | ✅ Full access | ✅ Full access |
| Transactions | ❌ No access | ❌ No access | Read only | Read only | ✅ Full access (system-admin only) |
| **Structural Collections** |
| Websites | Read | Read | Read | ❌ Update only<br>(no create/delete) | ✅ Full access |
| Users | Read own | Read own | Read own | Read own | ✅ Full access |
| Organizations | Read | ✅ Update own org | Read | ✅ Update own org | ✅ Full access |
| Topics | Read | Read | Read | ✅ Full access | ✅ Full access |
| Places | Read | Read | Read | ✅ Full access | ✅ Full access |
| Persons | Read | Read | Read | ✅ Full access | ✅ Full access |

**Legend**:
- ✅ = Has permission
- ❌ = No permission
- "Read published" = Can only see published content
- "Own X only" = Can only see/edit their own records
- Global admin = Users with `system-admin` in global `roles` (super admin)

**Notes on Role Combination**:
- Permissions are **additive** — users with multiple roles get the union of permissions
- A user with `['editor', 'commerce']` can edit articles **AND** manage products
- Access control functions use `...spread` to combine tenant IDs from all relevant roles
- No conflicts arise from having multiple roles on the same site

### Implementation Details

#### 1. User Collection Enhancement

**Rename field and expand roles:**

```typescript
// apps/historia/src/collections/Users/index.ts

// Before
const defaultTenantArrayField = tenantsArrayField({
  // ...
  rowFields: [
    {
      name: 'roles',  // ← RENAME
      type: 'select',s

**Update `getUserTenantIDs` utility** to use new field name:

```typescript
// apps/historia/src/utilities/getUserTenantIDs.ts
export const getUserTenantIDs = (
  user: User,
  role?: 'admin' | 'editor' | 'commerce' | 'member'
): string[] => {
  if (!user?.tenants) return [];

  return user.tenants
    .filter(tenant => {
      if (!role) return true;
      return tenant.siteRoles?.includes(role);
    })
    .map(tenant => {
      return typeof tenant.tenant === 'string'
        ? tenant.tenant
        : tenant.tenant.id;
    });
};
```

**Create role-specific access control functions:**

```typescript
// apps/historia/src/access/siteRoleAccess.ts

/**
 * Editors and admins can create/update content.
 *
 * Combines tenant IDs from both roles - users with either role (or both)
 * get access. The spread operator merges arrays, and Payload's `in` operator
 * handles duplicates gracefully.
 *
 * Example:
 * - User has 'admin' on Site A → access to Site A
 * - User has 'editor' on Site B → access to Site B
 * - User has both 'admin' and 'editor' on Site C → access to Site C (no conflict)
 */
export const siteEditorAccess: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;
  if (isSystemAdmin(req.user)) return true;

  // Combine tenant IDs from both admin and editor roles
  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');
  const editorTenantIDs = getUserTenantIDs(req.user, 'editor');
  const allTenantIDs = [...adminTenantIDs, ...editorTenantIDs];

  return allTenantIDs.length > 0
    ? { tenant: { in: allTenantIDs } }
    : false;
};

/**
 * Commerce managers and admins can manage products/orders
 */
export const siteCommerceAccess: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;
  if (isSystemAdmin(req.user)) return true;

  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');
  const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');
  const allTenantIDs = [...adminTenantIDs, ...commerceTenantIDs];

  return allTenantIDs.length > 0
    ? { tenant: { in: allTenantIDs } }
    : false;
};

/**
 * Site admins only (for sensitive operations)
 */
export const siteAdminAccess: Access = ({ req }) => {
  if (!req.user || !('email' in req.user)) return false;
  if (isSystemAdmin(req.user)) return true;

  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');

  return adminTenantIDs.length > 0
    ? { tenant: { in: adminTenantIDs } }
    : false;
};

/**
 * Any site member (inclueditors can create/update):

```typescript
// Articles, Happenings, Notes, Projects, Pages
{
  access: {
    create: siteEditorAccess,
    read: publishedOnly,
    update: siteEditorAccess,
    delete: isSystemAdmin,  // Only system-admin
    readVersions: siteEditorAccess,
  },
}

// Media
{
  access: {
    create: siteEditorAccess,
    read: siteMemberAccess,  // Members can view media
    update: siteEditorAccess,
    delete: isSystemAdmin,  // Only system-admin
  },
}

// Organizations
{
  access: {
    create: admins,  // Only system-admin creates orgs
    read: anyone,
    update: accessOR([editors, admins]),  // Editors and admins
    delete: admins,
  },
}
```

**E-commerce Collections** (commerce role required):

```typescript
// Products
{
  access: {
    create: siteCommerceAccess,
    read: publishedOnly,
    update: siteCommerceAccess,
    delete: isSystemAdmin,
    readVersions: siteCommerceAccess,
  },
}

// Orders
{
  access: {
    create: authenticated,  // Users create their own orders
    read: ({ req }) => {
      // System admins see all, commerce sees all in their tenants, users see own
      if (isSystemAdmin(req.user)) return true;

      const commerceTenantIDs = getUserTenantIDs(req.user, 'commerce');
      const adminTenantIDs = getUserTenantIDs(req.user, 'admin');

      if (commerceTenantIDs.length || adminTenantIDs.length) {
        return {
          or: [
            { user: { equals: req.user?.id } },
            { tenant: { in: [...commerceTenantIDs, ...adminTenantIDs] } }
          ]
        };
      }

      return { user: { equals: req.user?.id } };
    },
    update: siteCommerceAccess,
    delete: isSystemAdmin,
  },
}

// Shipments
{
  access: {
    create: siteCommerceAccess,
    read: ({ req }) => {
      // Same pattern as Orders
    },
    update: siteCommerceAccess,
    delete: isSystemAdmin,
  },
}

// Transactions (read-only for commerce and site admins, write only for system-admin)
{
  access: {
    create: isSystemAdmin,  // Only system-admin
    read: siteCommerceAccess,  // Commerce and site admins can view
    update: isSystemAdmin,  // Only system-admin
    delete: isSystemAdmin,  // Only system-admin
  },
}
```

**Structural Collections** (admin-only):

```typescript
// Websites, Topics, Places, Persons
{
  access: {
    create: isSystemAdmin,
    read: anyone,
    update: isSystemAdmin,
    delete: isSystemAdmin,
  },
}

// Users (role assignment restricted to system-admin only)
{
  access: {
    create: isSystemAdmin,  // Only system-admin can create users
    read: ({ req }) => {
      if (isSystemAdmin(req.user)) return true;
      // Users can only read their own record
      return { id: { equals: req.user?.id } };
    },
    update: isSystemAdmin,  // Only system-admin can assign roles
    delete: isSystemAdmin,
  },
}
```
        { label: 'Editor', value: 'editor' },
        { label: 'Commerce', value: 'commerce' },
        { label: 'Member', value: 'member' },
      ],
      required: true,
      admin: {
        description: 'Site-specific roles. Users can have multiple roles on a website.',
      },
    },
  ],
});
```

**Database schema changes:**

```sql
-- Rename column (Payload will auto-generate this)
ALTER TABLE users_tenants RENAME COLUMN roles TO site_roles;
: Core Implementation

**1. User Collection & Utilities**
- [ ] `apps/historia/src/collections/Users/index.ts`
  - Rename `roles` → `siteRoles` in tenantsArrayField
  - Update options: `['admin', 'editor', 'commerce', 'member']`
  - Update admin descriptions

- [ ] `apps/historia/src/utilities/getUserTenantIDs.ts`
  - Update to use `siteRoles` field name
  - Update type signature: `'admin' | 'editor' | 'commerce' | 'member'`

**2. Access Control Functions**
- [ ] `apps/historia/src/access/utils/accessOR.ts` (new file)
  - Helper function to combine multiple access functions with OR logic
  - Reusable across collections (similar pattern used in Carts)

- [ ] `apps/historia/src/access/admins.ts` (update existing)
  - Update to check both `system-admin` (global) AND site `admin` role
  - System admins get full access (`return true`)
  - Site admins get tenant-scoped access (`{ tenant: { in: adminTenantIDs } }`)
  - Field-level access remains `system-admin` only

- [ ] `apps/historia/src/access/siteRoleAccess.ts` (new file)
  - `siteEditorAccess` — For content editing (combines admin + editor roles)
  - `siteCommerceAccess` — For e-commerce operations (combines admin + commerce roles)
  - `siteAdminAccess` — For site-admin only operations
⚠️ **Direct role coupling** — Access control directly checks roles (not permissions layer)
  - Tradeoff: Simpler implementation, but changing role capabilities requires updating access control code
  - Mitigation: Well-documented role responsibilities, can add permission layer later if needed
  - `siteMemberAccess` — For any site member (all roles)

- [ ] Update existing access control files that reference `getUserTenantIDs`:
  - Clear role separation** — Content, commerce, and admin responsibilities are distinct
✅ **Improved security** — Specialized roles cannot delete or access sensitive operations
✅ **Better workflow** — Delegated responsibilities without over-privileging users
✅ **Field naming clarity** — `siteRoles` vs `roles` eliminates confusion
✅ **E-commerce ready** — Commerce role enables store management without full admin access
✅ **Multi-tenant isolation** — All roles are scoped to assigned websites
✅ **Scalability** — Users can have different roles on different tenants
✅ **Payload CMS patterns** — Follows official multi-tenant plugin best practices

### Considerations
⚠️ **Migration complexity** — Renaming field requires careful data migration
⚠️ **Admin burden** — Admins must assign appropriate roles to users
⚠️ **Role management** — Four roles per tenant increases complexity
⚠️ **Testing required** — Must verify all role permissions across collections
⚠️ **Documentation needed** — Users need clear guidance on role capabilities
⚠️ **Role assignment security** — Only `system-admin` can assign site roles to prevent privilege escalation

### Breaking Changes
🔴 **Field name change** — Code referencing `tenants[].roles` must update to `tenants[].siteRoles`
🔴 **Role value changes**:
  - `site-admin` → `admin`
  - `site-member` → `member`
  - Data migration required for existing users

### Migration Path for Existing Data
```typescript
// Payload migration will handle:
// 1. Rename column: roles → siteRoles
// 2. Update values: 'site-admin' → 'admin', 'site-member' → 'member'
// 3. Add new enum values: 'editor', 'commerce'
```

### Future Enhancements

**Phase 1: Permission-Based Access Control (PBAC)**
- Introduce permission layer mapping permissions to roles
- Example: `'content:create'` → `['admin', 'editor']`
- Benefits: Centralized permission management, easier to audit, DRY principle
- Allows changing role capabilities without touching access control code
- Reference: Similar to how Payload's built-in admin UI uses `permissions` object

**Phase 2: Advanced Workflows**
- **Approval workflow** — Editors submit drafts for admin approval before publish
- **Field-level permissions** — Restrict specific fields per role (e.g., `publishedAt` admin-only)
- **Collection-specific roles** — `article-editor`, `product-editor` for granular control
- **Audit logging** — Track which user/role made which changes
- **Time-bound roles** — Temporary access with expiration dates

**Phase 3: Custom Role Combinations**
- **Role bundles** — Define custom combinations (e.g., "content-manager" = editor + commerce)
- **Conditional permissions** — Time-based, IP-based, or context-based access
- **Role hierarchy** — Inherit permissions from parent roles
- [ ] `apps/historia/src/collections/Carts.ts`

**5. Database Migration**
- [ ] `pnpm payload migrate:create` — Generate migration
- [ ] Review auto-generated migration (field rename + enum changes)
- [ ] `pnpm payload migrate` — Apply migration

**6. Type Generation**
- [ ] `pnpm payload generate:types` — Update TypeScript types

#### Phase 2: Enhanced Draft Visibility (Optional)
- [ ] `apps/historia/src/access/publishedOrEditableAccess.ts`
- [ ] Update `read` access in content collections
  if (!req.user || !('email' in req.user)) return false;

  // System admins have full access
  if (isSystemAdmin(req.user)) return true;

  // Get tenant IDs where user is admin or editor
  const adminTenantIDs = getUserTenantIDs(req.user, 'admin');
  const editorTenantIDs = getUserTenantIDs(req.user, 'editor');
  const allTenantIDs = [...adminTenantIDs, ...editorTenantIDs];

  // Scope access to user's tenants
  return allTenantIDs.length > 0
    ? { tenant: { in: allTenantIDs } }
    : false;
};
```

#### 3. Collection Access Control Updates

**User Management** (system-admin only):
- Users: `create/update/delete: isSystemAdmin` (only system-admin can assign roles)

**Content Collections** (grant editor access):
- Articles: `create/update: siteEditorAccess, delete: admins`
- Happenings: `create/update: siteEditorAccess, delete: admins`
- Notes: `create/update: siteEditorAccess, delete: admins`
- Pages: `create/update: siteEditorAccess, delete: admins`
- Products: `create/update: siteEditorAccess, delete: admins`
- Projects: `create/update: siteEditorAccess, delete: admins`
- Organizations: `update: siteEditorAccess` (update only, no create/delete)
- Media: `create/update: siteEditorAccess, delete: admins`

**Structural Collections** (admin-only, no editor access):
- Websites: `create/update/delete: admins` (tenant configuration)
- Topics, Places, Persons: `create/update/delete: admins` (taxonomy affects all sites)

**Commerce Collections** (admin-only, privacy/financial sensitive):
- Orders, Shipments, Transactions: `admins` only

#### 4. Enhanced Draft Visibility (Optional Phase 2)

Create `publishedOrEditableAccess` for better collaboration:

```typescript
// apps/historia/src/access/publishedOrEditableAccess.ts
export const publishedOrEditableAccess: Access = ({ req }) => {
  // Published content is visible to everyone
  const publishedQuery = { _status: { equals: 'published' } };

  // Admins see everything
  if (req.user && 'email' in req.user && checkRole(['admin'], req.user)) {
    return true;
  }

  // Editors can see drafts in their tenants
  if (req.user && 'email' in req.user) {
    const editorTenantIDs = getUserTenantIDs(req.user, 'site-editor');
    const adminTenantIDs = getUserTenantIDs(req.user, 'site-admin');
    const allTenantIDs = [...adminTenantIDs, ...editorTenantIDs];

    if (allTenantIDs.length > 0) {
      return {
        or: [
          publishedQuery,
          { tenant: { in: allTenantIDs } }
        ]
      };
    }
  }

  return publishedQuery;
};
```

### Migration Strategy

1. **Create migration**: `pnpm payload migrate:create`
2. **Payload auto-generates** enum type change
3. **Run migration**: `pnpm payload migrate`
4. **Verify**: `pnpm payload migrate:status`

### Files Modified

#### Phase 1 (Core Implementation)
- [ ] `apps/historia/src/collections/Users/index.ts` — Add `site-editor` to roles
- [ ] `apps/historia/src/access/siteEditorAccess.ts` — New access control function
- [ ] `apps/historia/src/collections/Articles/index.ts` — Update access
- [ ] `apps/historia/src/collections/Happenings.ts` — Update access
- [ ] `apps/historia/src/collections/Notes.ts` — Update access (if exists)
- [ ] `apps/historia/src/collections/Products.ts` — Update access
- [ ] `apps/historia/src/collections/Projects.ts` — Update access
- [ ] `apps/historia/src/collections/Media.ts` — Update access
- [ ] `apps/historia/src/collections/Organizations.ts` — Update access (update only)
- [ ] Database migration (auto-generated)

#### Phase 2 (Enhanced Draft Visibility - Optional)
- [ ] `apps/historia/src/access/publishedOrEditableAccess.ts` — New access function
- [ ] Update `read` access in Articles, Happenings, Notes
- [ ] Update `readVersions` access to `siteEditorAccess`

## Consequences

### Positive
✅ **Improved security** — Editors cannot delete content or modify structural elements
✅ **Better workflow** — Delegated content management without full admin privileges
✅ **Multi-tenant isolation** — Editors only access their assigned websites
✅ **Scalability** — Users can be editors on multiple tenants
✅ **Payload CMS patterns** — Follows official multi-tenant plugin best practices
✅ **Backward compatible** — Existing `site-admin` and `site-member` roles unchanged

### Considerations
⚠️ **Admin burden** — Admins must assign `site-editor` role to appropriate users
⚠️ **Role proliferation** — More roles to manage (3 instead of 2 per tenant)
⚠️ **Testing required** — Must verify editor permissions across all collections

### Future Enhancements
- **Approval workflow** — Draft submissions require admin approval before publish
- **Field-level permissions** — Restrict editors from changing specific fields (e.g., `publishedAt`)
- **Collection-specific roles** — `article-editor`, `product-editor` for granular control
- **Audit logging** — Track which editor made which changes
- **Time-bound roles** — Temporary editor access with expiration

## References

- [Payload CMS Access Control](https://payloadcms.com/docs/access-control/overview)
- [Payload Multi-Tenant Plugin](https://payloadcms.com/docs/plugins/multi-tenant)
- Historia existing access patterns: `apps/historia/src/access/`
- Similar pattern in idem-idp: `apps/idem-idp/docs/adr/0007-admin-rbac.md`
- **Administrator Guide:** [Role-Based Access Control Guide](../administrator/role-based-access-control.md) — Practical guide for assigning and managing roles

## Decision Date
2026-01-17

## Authors
- Project Architect (with Content Architect consultation)
