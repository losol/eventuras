# ADR-0003: v3 domain model cleanup

## Status

Draft

## Context

With v3 we're already making breaking changes (Identity removal, string→uuid). This is the right time to also remove deprecated properties that have been marked `[Obsolete]` for a long time, and remove unused features. The goal is to clean up the domain model, drop unused DB columns/tables, and reduce confusion.

## Decision

### Remove deprecated Registration fields

Properties with no usage outside the domain entity:

- `ParticipantJobTitle` — column drop
- `ParticipantEmployer` — column drop
- `ParticipantCity` — column drop
- `ParticipantFirstName` / `ParticipantLastName` / `NameParts` — `[NotMapped]`, just delete
- `Verified` (bool) — column drop. Not the enum value `RegistrationStatus.Verified`, which stays.

Properties still referenced in services/controllers (requires minor refactoring):

- `Log` — migrate existing entries to `BusinessEvents` table, then drop column. Remove `AddLog()` method. Remove from `RegistrationDto`. Remove `AddLog` calls in `RegistrationPatchDto` and `RegistrationsController`.

### Remove deprecated Order fields

Safe to remove (no service usage):

- `ExternalInvoiceId` — column drop (replaced by `Invoice.ExternalInvoiceId`)
- `Paid` (bool) — column drop (replaced by `Invoice.Paid`)
- `AddLog()` — delete (only called internally)
- `CreateRefundOrder()` — delete

Requires minor refactoring:

- `Log` — migrate existing entries to `BusinessEvents` table, then drop column. Remove from `OrderDto`. Remove copy logic in `OrderRetrievalService`.

Deferred (separate PR):

- `CustomerName`, `CustomerEmail`, `CustomerVatNumber`, `CustomerInvoiceReference` — heavily used in the invoicing pipeline (InvoiceInfo, PowerOffice, Stripe). Removing requires refactoring invoicing services to read from Registration instead. Too much risk to change in this batch.

### Remove deprecated ApplicationUser fields

- `Log` (jsonb) — migrate existing entries to `BusinessEvents` table, then drop column. Remove `AddLog()` method.

### Remove deprecated EventInfo fields

- `ManageRegistrations` — column drop, remove from `EventFormDto`
- `ExternalRegistrationsUrl` — column drop, remove from `EventFormDto`, remove `HasExternalRegistrationPage` computed property

### Remove ExternalSync feature

The ExternalSync feature (`ExternalAccount`, `ExternalEvent`, `ExternalRegistration`) is not used in production. Remove entirely:

- Delete domain entities: `ExternalAccount.cs`, `ExternalEvent.cs`, `ExternalRegistration.cs`
- Delete service layer: `ExternalSync/` directory
- Remove DbSets from `ApplicationDbContext`
- Rename tables to `Archived_ExternalAccounts`, `Archived_ExternalEvents`, `Archived_ExternalRegistrations`
- Remove `ExternalAccounts` navigation from `Registration`

### Fix Certificate GUIDs

Change `Certificate.CertificateGuid` and `Certificate.Auth` from `Guid.NewGuid()` to `Guid.CreateVersion7()` for consistency.

### API backwards compatibility

The v3 API preserves all existing DTO fields to avoid breaking clients:

- `RegistrationDto.Log` — populated from `BusinessEvents` where `SubjectType = 'Registration'` (read-only, will be removed in v4)
- `OrderDto.Log` — populated from `BusinessEvents` where `SubjectType = 'Order'` (read-only, will be removed in v4)
- `EventFormDto.ManageRegistrations` — hardcoded to `true` in responses, ignored on input
- `EventFormDto.ExternalRegistrationsUrl` — hardcoded to `""` in responses, ignored on input

## Consequences

### Positive

- ~15 unused columns removed from domain entities
- 3 unused tables archived
- Dead ExternalSync service layer removed (~8 files)
- Cleaner domain model with no `[Obsolete]` noise
- Legacy log data migrated to `BusinessEvents` — queryable and structured
- No breaking API changes for v3 clients

### Negative

- Order customer fields deferred — still have `[Obsolete]` properties
- DTO shims for Log/ManageRegistrations/ExternalRegistrationsUrl add minor complexity until v4

## Migration

One EF migration that:

1. Migrates legacy Log data to `BusinessEvents` table (see below)
2. Drops Log columns after migration
3. Drops columns for other removed properties
4. Renames ExternalSync tables to `Archived_*`

### Log data migration SQL

The migration converts JSON log arrays from three entities into structured `BusinessEvents` rows. Each log entry becomes one `BusinessEvent` with `EventType = 'legacy.log'`.

**ApplicationUser.Log** (jsonb, array of objects with Timestamp/Message/UserId/Level):

```sql
INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "ActorUserUuid", "Message", "MetadataJson")
SELECT gen_random_uuid(),
       COALESCE((elem->>'Timestamp')::timestamptz, NOW()) AT TIME ZONE 'UTC',
       'legacy.log',
       'User',
       "Id",
       CASE WHEN elem->>'UserId' IS NOT NULL AND elem->>'UserId' != ''
            THEN (elem->>'UserId')::uuid ELSE NULL END,
       COALESCE(elem->>'Message', ''),
       jsonb_build_object('level', elem->>'Level', 'source', 'ApplicationUser.Log')
FROM "Users", jsonb_array_elements("Log") AS elem
WHERE "Log" IS NOT NULL AND "Log" != '[]';
```

**Registration.Log** and **Order.Log** (text columns containing JSON arrays):

```sql
INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "Message", "MetadataJson")
SELECT gen_random_uuid(),
       COALESCE((elem->>'Timestamp')::timestamptz, NOW()) AT TIME ZONE 'UTC',
       'legacy.log',
       'Registration',
       "Uuid",
       COALESCE(elem->>'Text', elem->>'Message', ''),
       jsonb_build_object('source', 'Registration.Log')
FROM "Registrations", jsonb_array_elements("Log"::jsonb) AS elem
WHERE "Log" IS NOT NULL AND "Log" != '' AND "Log" != '[]';

INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "Message", "MetadataJson")
SELECT gen_random_uuid(),
       COALESCE((elem->>'Timestamp')::timestamptz, NOW()) AT TIME ZONE 'UTC',
       'legacy.log',
       'Order',
       "Uuid",
       COALESCE(elem->>'Text', elem->>'Message', ''),
       jsonb_build_object('source', 'Order.Log')
FROM "Orders", jsonb_array_elements("Log"::jsonb) AS elem
WHERE "Log" IS NOT NULL AND "Log" != '' AND "Log" != '[]';
```

After the inserts succeed, the Log columns are dropped.

## Files to modify

| Area | Files |
| --- | --- |
| Domain | `Registration.cs`, `Order.cs`, `ApplicationUser.cs`, `EventInfo.cs`, `Certificate.cs` |
| Domain (delete) | `ExternalAccount.cs`, `ExternalEvent.cs`, `ExternalRegistration.cs` |
| Services (delete) | `ExternalSync/` directory (8+ files) |
| Services | `Orders/OrderRetrievalService.cs` |
| WebApi | `RegistrationDto.cs`, `RegistrationPatchDto.cs`, `RegistrationsController.cs`, `OrderDto.cs`, `EventFormDto.cs` |
| Infrastructure | `ApplicationDbContext.cs` (remove DbSets + model config) |
