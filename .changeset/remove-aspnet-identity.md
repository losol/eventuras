---
"@eventuras/api": major
---

Remove ASP.NET Identity dependency. This is a **breaking change**.

- User IDs are now `uuid` instead of `text` in the database and API responses
- The `AspNetUsers` table is renamed to `Users`
- Six unused Identity tables are dropped: `AspNetRoles`, `AspNetUserRoles`, `AspNetRoleClaims`, `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens`
- Seven unused columns are dropped from the Users table: `PasswordHash`, `SecurityStamp`, `ConcurrencyStamp`, `LockoutEnd`, `LockoutEnabled`, `AccessFailedCount`, `TwoFactorEnabled`
- Global roles (`Admin`, `SystemAdmin`) are now sourced exclusively from IdP JWT claims — they are no longer stored in or read from the database

**Prerequisites:** All admin role assignments must exist in the IdP (Authentik) before deploying. See `docs/upgrade-to-v3.md` for the full upgrade guide.

**Database migration required.** Run `dotnet ef database update` or apply the idempotent SQL script. Take a database backup before migrating.
