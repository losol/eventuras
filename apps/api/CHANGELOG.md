# @eventuras/api

## 3.0.0

### Major Changes

- 4dfcb2f: ### v3.0 — New identity, UUID all the things, and domain cleanup

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

### Minor Changes

- 558cab2: Cleanup legacy code by removing the `MessageLog` domain entity and `MessageLogs` DbSet.
  The `MessageLogs` table is renamed to `Archived_MessageLog` in the database to preserve historical data.
  Foreign keys and indexes are dropped so archived data is not affected by cascade deletes.
  Obsolete `RegistrationBy` and `VerificationCode` columns are removed from the `Registrations` table.

  **Database migration required.** Run `dotnet ef database update` or apply the idempotent SQL script at `src/Eventuras.Infrastructure/sqlscript/database-migrations.sql`.

## 2.31.0

### Minor Changes

- 8db0d59: Add Featured and IncludePastCollections filters to event collections API
  - Featured filter to query only featured collections
  - IncludePastCollections filter (default false) to hide collections where all events have passed
  - Computed dateStart/dateEnd on EventCollectionDto based on contained events

## 2.30.3

### Patch Changes

- 0cc8937: ### ⚙️ CI/CD
  - ci(api): add short SHA output and dispatch release to infra (02e2d56) [@eventuras/api]

- e6d002d: ### Fix: Event description 300 character limit validation (#690)
  - Validate markdown length (not plain text) in MarkdownInput, since markdown is what gets stored
  - Block form submission via react-hook-form when description exceeds 300 characters
  - Add `[StringLength(300)]` to API EventFormDto for a clear 400 response instead of 500
  - Migrate scribo eslint config to flat config format

## 2.30.2

### Patch Changes

- 59bfb7c: ### 🐛 Fix
  - fix(api): switch to standard JSON log formatter for Grafana/Loki compatibility

## 2.30.1

### Patch Changes

- 7f89ee6: ♻️ Refactoring
  - refactor(api): update API documentation and endpoints to use Scalar (8c62852) [@eventuras/api]
  - refactor(api): integrate Scalar API reference (6ea6ac2) [@eventuras/api]

## 2.30.0

### Minor Changes

- 949d8b6: ### 🧱 Features
  - feat(api,web): implement correlation ID handling across API requests and responses (8055dac) [@eventuras/api]

### Patch Changes

- d752b18: ### 🐞 Bug Fixes
  - fix(web): sync turbo.json env vars with app.config.json (28c8deb) [@eventuras/web]

  ♻️ Refactoring
  - refactor(web): replace Auth0 with generic OIDC auth routes (574acae) [@eventuras/web]

- 2bdf1aa: ### 🧹 Maintenance
  - chore(api): update test project references (14f1ede) [@eventuras/api]
  - chore(api): update package references to latest versions (5d4b656) [@eventuras/api]
  - chore(api): remove unused featured disabled exception (0d9d2fd) [@eventuras/api]
  - chore(api): remove Feature Management package references (83940b0) [@eventuras/api]

## 2.29.0

### Minor Changes

- 10235ad: ### 🧱 Features
  - feat(web): implement PDF certificate proxy (7375ef3) [@eventuras/web]

  ### 🐞 Bug Fixes
  - fix(web): improve error handling in createEvent function (89e8953) [@eventuras/web]

- 867c9f3: ### 🧱 Features
  - feat(web): enhance EconomySection with status grouping (821fc39) [@eventuras/web]

## 2.27.10

### Patch Changes

- 65bcedb: ### 🧹 Maintenance
  - chore(infra): adopt Kubernetes deployment via ArgoCD with Helm provisioner chart

## 2.27.1

- Sync release versions across packages api, web, event-sdk

## 0.9.1

### Patch Changes

- ### 🧹 Maintenance
  - chore(api): update deps (823704c) [@eventuras/api]

## 0.7.1

### Patch Changes

### 📝 Documentation

- docs(api): spec file-based email template system (badb44c) [@eventuras/api]

## 0.7.0

### Minor Changes

### 🧱 Features

- feat(api): new PDF generation library and refactor related services (e8e4129) [@eventuras/api]

### 📝 Documentation

- 📝 docs(api): add OpenAPI specification for Eventuras API (70b906e) [@eventuras/api]

### 🐞 Bug Fixes

- fix(api): correct pdfOptions capitalization (0d1ccdc) [@eventuras/api]
- fix(api): update PDF extraction and generation logic (60c226d) [@eventuras/api]
- fix(api): update project reference path for email project (6a93a59) [@eventuras/api]
- fix(api): handle null values for recipient and customer names (61bd64d) [@eventuras/api]
- fix(api): registration patch fixed (5c6b45c) [@eventuras/api]
- fix(api): correct route for PUT to userprofile (5f39690) [@eventuras/api]

### ♻️ Refactoring

- refactor(api): migrate PDF generation to QuestPDF (3bd95b5) [@eventuras/api]
- refactor(api): use iText (5e4436e) [@eventuras/api]
- refactor(api): update editorconfig (28403c6) [@eventuras/api]
- refactor(api): code cleanup (1a36add) [@eventuras/api]
- refactor(api): simplify JSON content creation in tests (9aa73f3) [@eventuras/api]
- refactor(api): streamline JSON serialization in ConvertoClient and HttpClientExtensions (53eee83) [@eventuras/api]
- refactor(api): migrate from Newtonsoft.Json to System.Text.Json for serialization (fa969e5) [@eventuras/api]
- refactor(api): consolidate libs and src folders (2025501) [@eventuras/api]
- refactor(api): streamline organization query methods and improve access control logic (a752e5b) [@eventuras/api]

### ✅ Testing

- test(api): add integration tests for RegistrationProductsController (1038580) [@eventuras/api]
- test(api): remove RegistrationProductsIntegrationTests that doesn't follow testing patterns (14e7217) [@eventuras/api]
- test(api): add unit and integration tests for Registration functionality (278111b) [@eventuras/api]

### 🧹 Maintenance

- chore(api): upgrade dependencies across multiple projects to latest versions (cb1409c) [@eventuras/api]
- chore(api): optimize background job queues and improve email sending rate limit (d88643a) [@eventuras/api]
- chore(api): some updates (a0067bb) [@eventuras/api]
- chore(api): remove legacy CodeGeneration (1e1eda8) [@eventuras/api]
- chore(api): add some tests to pdf lib (38d2611) [@eventuras/api]
- chore(api): remove unnecessary dep (f5d94b0) [@eventuras/api]
- chore(api): use net backgroundservice instead of hangfire (854a4ef) [@eventuras/api]
- chore(api): remove old healthchecks implementation and ui (2c78a36) [@eventuras/api]
- chore(api): use slnx format for solution (8288200) [@eventuras/api]
- chore(api): remove deprecated tests (3049b91) [@eventuras/api]
- chore(api): remove dep (3305613) [@eventuras/api]
- chore(api): use microsoft testing platform v2 (f9d15f8) [@eventuras/api]
- chore(api): optimize query filters for EF Core 9 compatibility (009fc60) [@eventuras/api]
- chore(api): upgrade to net10 (92d1669) [@eventuras/api]
- chore(api): upgrade xunit to v3.2 (8322aa5) [@eventuras/api]
- chore(api): update notification DTOs to include subject and message fields (5de604a) [@eventuras/api]
- chore(api): upgrade stripe deps (f8e99ef) [@eventuras/api]
- chore(api): remove old packages (e90be25) [@eventuras/api]
- chore(api): readd Newtonsoft.Json just to get a patched version (236f2ed) [@eventuras/api]
- chore(api): update package references (69a7fbf) [@eventuras/api]
- chore(api): house cleaning for registration model (0c16931) [@eventuras/api]
- chore(api): remove legacy status change method (5f22dd8) [@eventuras/api]
- chore(api): set default ports all over (53db33e) [@eventuras/api]
- chore(api): update deps (c380b75) [@eventuras/api]

### ⚙️ CI/CD

- ci(api): update Dockerfile to use slnx format (a1a84d9) [@eventuras/api]
- ci(api): set dotnet versions (643b7da) [@eventuras/api]
- ci(api): upgrade setup-dotnet action to v5 (66374a2) [@eventuras/api]

## 0.6.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - chore(api): upgrade dependencies across projects (50df419)
  - feat(api): add more data to excel export (42c4aa8)
  - chore(api): dotnet package updates (7d05b1a)
  - feat(api): orders population by registrations (1c9c984)
  - chore(api): upgrade packages (d0fdad1)
  - fix(api): ensure customers have a name (26ce11a)
  - fix(api): correct the format of dates converted from localdates (83e43cb)
  - fix(api): fixes bug in product delivery summary (87bb21e)
  - chore(api): upgrade nuget packages (5859444)
  - chore(api): dotnet package upgrades (27870a1)
  - chore(api): update dependencies for registrations backend (7449ff2)
  - refactor(api): refactor the excel export service (e7c74c1)
  - feat(api): adds export registrations to excel (f8dc480)
  - feat(api): allow admins to remove mandatory products (c084541)
  - chore(api): upgrade dotnet packages 2024-04-21 (5ee0a92)
  - feat(api): add error handling to pdf generator (11d3e13)
  - chore(api): upgrade backend packages (4050111)
  - refactor(api): consolidate comunications projects (55a05fd)
  - feat(api): provide more Order information for frontend (1a6e9a5)
  - feat(api): add filtering events by collection (26b6c24)
  - feat(api): finish event collections api (f504478)
  - fix(api): fix failing tests (77f2482)
  - feat(api): extend user profile with new fields (dfea21d)
  - chore(api): backend updates 2024-02-14 (ab568f2)
  - chore(api): backend packages 2024-02-12 (a91288f)
  - fix(api): add using System (93052e3)
