---
"@eventuras/api": minor
---

Cleanup legacy code by removing the `MessageLog` domain entity and `MessageLogs` DbSet.
The `MessageLogs` table is renamed to `Archived_MessageLog` in the database to preserve historical data.
Foreign keys and indexes are dropped so archived data is not affected by cascade deletes.
Obsolete `RegistrationBy` and `VerificationCode` columns are removed from the `Registrations` table.

**Database migration required.** Run `dotnet ef database update` or apply the idempotent SQL script at `src/Eventuras.Infrastructure/sqlscript/database-migrations.sql`.
