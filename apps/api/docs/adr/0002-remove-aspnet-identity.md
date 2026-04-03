# ADR-0002: Remove ASP.NET Identity dependency

## Status

Accepted

## Context

The application inherits `ApplicationUser` from `IdentityUser` and `ApplicationDbContext` from `IdentityDbContext`. With the migration to external IdP, most of ASP.NET Identity is unused:

- **Password fields** (`PasswordHash`, `SecurityStamp`, `ConcurrencyStamp`) — unused, auth is handled by Idp
- **Lockout/2FA fields** (`LockoutEnd`, `TwoFactorEnabled`, etc.) — unused
- **AspNetUserLogins, AspNetUserTokens, AspNetRoleClaims** tables — unused
- **RoleManager** — only used in `DbInitializer` to seed three global roles
- **UserManager** — only used for `FindByEmailAsync`, `CreateAsync`, `NormalizeEmail` — replaceable with direct EF queries

### What IS actively used

- **ApplicationUser domain fields** — `GivenName`, `FamilyName`, `Email`, address fields, etc.
- **AspNetUsers table** — user profile storage
- **Global roles** (`Admin`, `SuperAdmin`, `SystemAdmin`) — currently in `AspNetRoles` + `AspNetUserRoles`
- **Organization-specific roles** — already in custom `OrganizationMemberRole` table, not Identity
- **Claims transformation** — `DbUserClaimTransformation` enriches incoming JWT with DB-sourced roles

### Dual role system today

1. **Global roles** via `AspNetUserRoles` — Admin, SuperAdmin, SystemAdmin
2. **Organization roles** via `OrganizationMemberRole` — custom table, independent of Identity

## Decision

Remove the ASP.NET Identity dependency. Replace with direct EF Core user management and idp-sourced roles.

### User entity

- Remove `IdentityUser` inheritance from `ApplicationUser`
- Keep all domain fields (`GivenName`, `FamilyName`, `Email`, address, etc.)
- Convert existing `string Id` (already contains GUID values) to `Guid Uuid`
- `Uuid` matches the IdP subject ID — no separate mapping field needed
- Update all FKs referencing `AspNetUsers.Id` to use `Guid` type

### Database context

- Replace `IdentityDbContext<ApplicationUser>` with plain `DbContext`
- Drop unused tables: `AspNetUserLogins`, `AspNetUserTokens`, `AspNetRoleClaims`
- Migrate global roles from `AspNetRoles`/`AspNetUserRoles` to a simpler `UserRole` column or similar
- Keep `OrganizationMemberRole` as-is

### Global roles

- Remove `SuperAdmin` role — unused, merge any assignments into `SystemAdmin`
- Remaining global roles: `Admin`, `SystemAdmin`
- Move global role assignment to IdP (groups/roles in IdP)
- Trust incoming JWT claims for global roles
- Remove `RoleManager`, `AspNetRoles`, and `AspNetUserRoles` tables
- Remove role seeding from `DbInitializer`

### Claims

- Simplify `DbUserClaimTransformation`:
  - Global roles come from JWT token (Idp) — no DB lookup needed
  - Organization-specific roles still require DB lookup via `OrganizationMemberRole`
- Remove `ApplicationClaimsIdentityFactory` (extends `UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>`)
- Update `ClaimsPrincipalExtensions` to read claims from Idp token format

### User management

- Replace `UserManager.FindByEmailAsync` with direct EF query
- Replace `UserManager.CreateAsync` with direct EF `Add` + `SaveChanges`
- Remove `UserManager` dependency entirely

## Consequences

### Positive

- Removes ~10 unused columns from user table
- Drops 4-5 unused Identity tables
- Eliminates hidden Identity middleware and services
- Simplifies claims pipeline — trust IdP for global roles
- Clearer separation: Idp owns authentication and global roles, app owns org roles

### Negative

- Migration effort to move global roles to Idp
- Need to handle existing `AspNetUserRoles` data during migration
- `UserManager` convenience methods must be replaced (minor)

## Upgrade guide

### Prerequisites (must be done BEFORE deploying this migration)

1. **Verify IdP role assignments** — All admin users MUST have their global roles (`Admin`, `SystemAdmin`) assigned as groups/roles in Authentik. After this migration, the application trusts JWT claims exclusively for global roles. Run this query against prod to find current role assignments:

   ```sql
   SELECT u."Email", r."Name" as "Role"
   FROM "AspNetUserRoles" ur
   JOIN "AspNetUsers" u ON ur."UserId" = u."Id"
   JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
   ORDER BY u."Email";
   ```

   Every row returned must have a corresponding group membership in Authentik.

2. **Take a database backup** — `pg_dump` the full database before running the migration.

### What the migration does

The `RemoveAspNetIdentity` migration performs these changes:

| Action | Details |
| --- | --- |
| **Drops 6 Identity tables** | `AspNetRoles`, `AspNetUserRoles`, `AspNetRoleClaims`, `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens` |
| **Drops 7 unused columns** from Users | `PasswordHash`, `SecurityStamp`, `ConcurrencyStamp`, `LockoutEnd`, `LockoutEnabled`, `AccessFailedCount`, `TwoFactorEnabled` |
| **Renames table** | `AspNetUsers` → `Users` |
| **Converts all user IDs** | `text` → `uuid` (PK + all FKs) |
| **Makes Email NOT NULL** | `Email` and `NormalizedEmail` are now required |
| **Cleans orphaned rows** | Deletes rows with NULL `UserId` in `Registrations`, `OrganizationMembers`, `Orders`, `ExternalAccounts` |

### Breaking changes

- **API user IDs** are now `uuid` type in JSON responses (previously `string`). The format is identical (`"550e8400-e29b-41d4-a716-446655440000"`), but clients using strict type checking may need updates.
- **Global roles are no longer stored in the database.** They must come from the IdP JWT token.
- The `SuperAdmin` role still exists in code but should be phased out in favor of `SystemAdmin`.

### Rollback

The migration has a `Down` method that recreates all dropped tables and reverts column types. However, **role assignment data will be lost** — the `Down` method recreates empty `AspNetRoles` and `AspNetUserRoles` tables.

---

## Appendix A: Current Identity coupling

| Component | Identity dependency | Replacement |
| --- | --- | --- |
| `ApplicationUser : IdentityUser` | Base class | Standalone entity with own fields |
| `ApplicationDbContext : IdentityDbContext` | Base class | Plain `DbContext` |
| `UserManager.FindByEmailAsync` | Service | `dbContext.Users.FirstOrDefaultAsync(u => u.Email == email)` |
| `UserManager.CreateAsync` | Service | `dbContext.Users.Add(user)` |
| `RoleManager.CreateAsync` | Service | Remove — roles from Idp |
| `UserManager.AddToRoleAsync` | Service | Remove — roles from Idp |
| `ApplicationClaimsIdentityFactory` | `UserClaimsPrincipalFactory` | Custom claims builder |
| `DbUserClaimTransformation` | `IClaimsTransformation` | Keep, simplify to only fetch org roles |

## Appendix B: Tables to remove

- `AspNetRoles` — replaced by Idp groups
- `AspNetUserRoles` — replaced by Idp group membership
- `AspNetRoleClaims` — unused
- `AspNetUserLogins` — unused
- `AspNetUserTokens` — unused
- `AspNetUserClaims` — unused

## Appendix C: Files requiring modification

- `ApplicationUser.cs` — remove inheritance
- `ApplicationDbContext.cs` — switch base class
- `ServiceCollectionExtensions.cs` — remove `AddIdentity()`, `AddDefaultTokenProviders()`
- `DbInitializer.cs` — remove role/user seeding via Identity
- `ApplicationClaimsIdentityFactory.cs` — remove entirely
- `DbUserClaimTransformation.cs` — simplify to org-role lookup only
- `UserManagementService.cs` — replace UserManager calls
- `DefaultAuthenticationService.cs` — replace UserManager calls

## Appendix D: Future consideration — multi-IdP support

If a user needs identities from multiple IdP providers, introduce a separate mapping table:

```csharp
public class UserExternalIdentity
{
    public Guid Uuid { get; set; } = Guid.CreateVersion7();
    public Guid UserUuid { get; set; }
    public string Issuer { get; set; }    // e.g. "https://auth.example.com"
    public string SubjectId { get; set; } // IdP's sub claim
}
```

This allows one user to be linked to multiple external identities without coupling the user entity to a specific IdP.
