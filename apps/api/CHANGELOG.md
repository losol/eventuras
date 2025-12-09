# @eventuras/api

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
