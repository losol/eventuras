# Upgrade guide: v3

This guide covers the breaking database migrations in v3.

## Migrations included

| Migration | Description |
| --- | --- |
| `RemoveMessageLog` | Archives deprecated `MessageLogs` table, removes `RegistrationBy` and `VerificationCode` columns from `Registrations` |
| `RemoveAspNetIdentity` | Removes ASP.NET Identity, renames `AspNetUsers` → `Users`, converts user IDs to `uuid` |
| `CleanupDeprecatedFields` | Removes deprecated columns, migrates Log data to `BusinessEvents`, archives ExternalSync tables |
| `AddUuidToAllEntities` | Adds `Uuid` column to all entities, renames `Certificate.CertificateGuid` → `Uuid`, drops `Certificate.Auth` |

For background, see [ADR-0002](adr/0002-remove-aspnet-identity.md), [ADR-0003](adr/0003-v3-domain-cleanup.md), and [ADR-0004](adr/0004-add-uuid-to-all-entities.md).

## Prerequisites (BEFORE deploying)

### 1. Verify IdP role assignments

All admin users **must** have their global roles (`Admin`, `SystemAdmin`) assigned as groups/roles in Authentik before this migration runs. After migration, the application trusts JWT claims exclusively for global roles — the database role tables will be deleted.

Run this query against production to find current role assignments:

```sql
SELECT u."Email", r."Name" as "Role"
FROM "AspNetUserRoles" ur
JOIN "AspNetUsers" u ON ur."UserId" = u."Id"
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
ORDER BY u."Email";
```

Every row returned must have a corresponding group membership in Authentik. If any are missing, users will lose admin access immediately after deploy.

### 2. Take a database backup

```bash
pg_dump -Fc eventuras > eventuras-pre-v3-$(date +%Y%m%d).dump
```

## What the migration does

| Action | Details |
| --- | --- |
| **Drops 6 Identity tables** | `AspNetRoles`, `AspNetUserRoles`, `AspNetRoleClaims`, `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens` |
| **Drops 7 unused columns** from Users | `PasswordHash`, `SecurityStamp`, `ConcurrencyStamp`, `LockoutEnd`, `LockoutEnabled`, `AccessFailedCount`, `TwoFactorEnabled` |
| **Renames table** | `AspNetUsers` → `Users` |
| **Converts all user IDs** | `text` → `uuid` (PK and all FKs) |
| **Makes Email NOT NULL** | `Email` and `NormalizedEmail` are now required |
| **Cleans orphaned rows** | Deletes rows with NULL `UserId` in `Registrations`, `OrganizationMembers`, `Orders`, `ExternalAccounts` |
| **Migrates legacy logs** | Converts `ApplicationUser.Log`, `Registration.Log`, and `Order.Log` JSON entries into `BusinessEvents` rows with `EventType = 'legacy.log'` |
| **Drops deprecated columns** | `Registration`: `ParticipantJobTitle`, `ParticipantEmployer`, `ParticipantCity`, `Verified`, `Log`. `Order`: `ExternalInvoiceId`, `Paid`, `Log`. `Users`: `Log`. `EventInfos`: `ManageRegistrations`, `ExternalRegistrationsUrl` |
| **Archives ExternalSync tables** | `ExternalAccounts` → `Archived_ExternalAccounts`, `ExternalEvents` → `Archived_ExternalEvents`, `ExternalRegistrations` → `Archived_ExternalRegistrations` |

## Breaking changes

### API

- **User IDs** are now `uuid` type in JSON responses (previously `string`). The serialized format is identical (`"550e8400-e29b-41d4-a716-446655440000"`), but clients using strict type checking may need updates.
- **Organization member endpoints** now expect `Guid` user IDs in URL parameters (e.g., `/v3/organizations/{orgId}/members/{userId}`). Non-GUID values will return `400 Bad Request` instead of `404 Not Found`.

### Authentication and authorization

- **Global roles** (`Admin`, `SystemAdmin`) are no longer read from the database. They must be present in the IdP JWT token as role claims.
- **Organization-specific roles** continue to work as before — they are stored in the `OrganizationMemberRole` table and enriched via `DbUserClaimTransformation`.
- The `SuperAdmin` role still exists in code but should be phased out in favor of `SystemAdmin`.

### Database

- Any code or tools that reference `AspNetUsers` must be updated to use `Users`.
- Any code that stores user IDs as `text`/`varchar` must be updated to use `uuid`.

## Rollback

The migration has a `Down` method that recreates all dropped tables and reverts column types. However, **role assignment data will be lost** — the `Down` method recreates empty `AspNetRoles` and `AspNetUserRoles` tables. Restore from the pre-migration backup instead.
