---
"@eventuras/api": major
---

### v3.0 — New identity, UUID all the things, and domain cleanup

This is a **breaking database migration**. See `docs/upgrade-to-v3.md` for the full upgrade guide.

#### Identity removal

- Remove ASP.NET Identity dependency — `ApplicationUser` is now a plain POCO
- User IDs converted from `text` to `uuid` in the database and API responses
- `AspNetUsers` table renamed to `Users`
- Six unused Identity tables dropped
- Seven unused columns dropped from Users table
- Global roles (`Admin`, `SystemAdmin`) sourced exclusively from IdP JWT claims
- Claims pipeline simplified — `DbUserClaimTransformation` enriches JWT with DB user ID and org roles
- Caching removed from claims transformation

#### SuperAdmin role removed

- `SuperAdmin` role removed entirely — use `SystemAdmin` instead
- `IsSuperAdmin()` and `IsPowerAdmin()` replaced with `IsSystemAdmin()`
- Migration converts existing `SuperAdmin` org role assignments to `SystemAdmin`
- IdP must rename any `SuperAdmin` groups to `SystemAdmin` before deploy

#### Domain model cleanup

- Deprecated fields removed: `Registration.ParticipantJobTitle/Employer/City/Verified/Log`, `Order.ExternalInvoiceId/Paid/Log`, `ApplicationUser.Log`, `EventInfo.ManageRegistrations/ExternalRegistrationsUrl`
- Legacy log data migrated to `BusinessEvents` table (queryable, structured)
- `ExternalSync` feature removed (ExternalAccount/Event/Registration entities + service layer archived)
- Dead code removed: `OrderLine.CreateRefundOrderLine()`, `Order.CreateRefundOrder()`, `PaymentMethodService`, `DbInitializerOptions`
- `Certificate.Auth` column dropped, `CertificateGuid` renamed to `Uuid`
- Order customer fields (`CustomerName/Email/VatNumber/InvoiceReference`) kept as intentional snapshot denormalization

#### UUID on all entities

- `Uuid` column (UUIDv7) added to all entities for future v4 API migration
- Unique indexes on all `Uuid` columns
- Existing rows backfilled with `uuidv7()`

#### Audit logging

- `BusinessEvent` logging added for order and registration status changes
- Replaces removed `AddLog()` / `SetStatus()` methods

#### API backwards compatibility (v3)

- `RegistrationDto.Log` and `OrderDto.Log` preserved in responses (return default values)
- `EventFormDto.ManageRegistrations` hardcoded to `true`
- `EventFormDto.ExternalRegistrationsUrl` hardcoded to `""`
- `CertificateDto.CertificateGuid` field name preserved

#### Other

- `DefaultAuthenticationService` and `IEventurasAuthenticationService` removed (JWT-only API)
- `NotAccessibleException` used instead of `InvalidOperationException` for missing user ID
- `Email` made required on `ApplicationUser`

**Prerequisites:** Verify IdP role assignments and take a database backup before deploying.

**Database migration required.** Four migrations: `RemoveMessageLog`, `RemoveAspNetIdentity`, `CleanupDeprecatedFields`, `AddUuidToAllEntities`.
