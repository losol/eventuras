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

- `Log` (jsonb) — rename column to `Archived_RegistrationLog`. Remove `AddLog()` method. Remove from `RegistrationDto`. Remove `AddLog` calls in `RegistrationPatchDto` and `RegistrationsController`.
- `AddLog()` — delete

### Remove deprecated Order fields

Safe to remove (no service usage):

- `ExternalInvoiceId` — column drop (replaced by `Invoice.ExternalInvoiceId`)
- `Paid` (bool) — column drop (replaced by `Invoice.Paid`)
- `AddLog()` — delete (only called internally)
- `CreateRefundOrder()` — delete

Requires minor refactoring:

- `Log` (jsonb) — rename column to `Archived_OrderLog`. Remove from `OrderDto`. Remove copy logic in `OrderRetrievalService`.

Deferred (separate PR):

- `CustomerName`, `CustomerEmail`, `CustomerVatNumber`, `CustomerInvoiceReference` — heavily used in the invoicing pipeline (InvoiceInfo, PowerOffice, Stripe). Removing requires refactoring invoicing services to read from Registration instead. Too much risk to change in this batch.

### Remove deprecated ApplicationUser fields

- `Log` (jsonb) — rename column to `Archived_UserLog`. Remove `AddLog()` method.

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

## Consequences

### Positive

- ~15 unused columns removed from domain entities
- 3 unused tables archived
- Dead ExternalSync service layer removed (~8 files)
- Cleaner domain model with no `[Obsolete]` noise
- Log data preserved via `Archived_*` column renames

### Negative

- Breaking API changes (fields removed from DTOs)
- Order customer fields deferred — still have `[Obsolete]` properties

## Migration

One EF migration that:

1. Drops columns for removed properties
2. Renames jsonb Log columns to `Archived_*` (preserving data)
3. Renames ExternalSync tables to `Archived_*`

## Files to modify

| Area | Files |
| --- | --- |
| Domain | `Registration.cs`, `Order.cs`, `ApplicationUser.cs`, `EventInfo.cs`, `Certificate.cs` |
| Domain (delete) | `ExternalAccount.cs`, `ExternalEvent.cs`, `ExternalRegistration.cs` |
| Services (delete) | `ExternalSync/` directory (8+ files) |
| Services | `Orders/OrderRetrievalService.cs` |
| WebApi | `RegistrationDto.cs`, `RegistrationPatchDto.cs`, `RegistrationsController.cs`, `OrderDto.cs`, `EventFormDto.cs` |
| Infrastructure | `ApplicationDbContext.cs` (remove DbSets + model config) |
