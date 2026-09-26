---
'@eventuras/api': minor
---

`ProcessingPurpose.PurposeKind` now reads `Consent` and `Reservation` instead of `OptIn` and `OptOut`. Opt-in and opt-out describe a checkbox; consent and reservation describe what the purpose is, and they were already the words the comments and the check constraints used to explain themselves.

No migration. The members keep their stored values, 1 and 2, so nothing in the database changes and `dotnet ef migrations has-pending-model-changes` reports none. Renaming a public member is source-breaking for anything compiling against `Eventuras.Domain`, but the enum shipped in 3.12.0 five days ago with nothing referring to it, so this is released as a minor rather than held for a major.

The check constraint keeps the name `CK_ProcessingPurposes_SpecialCategoryIsOptIn`. It is a database object, not a symbol, and renaming it would need the migration this change otherwise avoids.
