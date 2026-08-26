---
'@eventuras/api': minor
---

Data model for processing purposes and user decisions: `ProcessingPurpose` (immutable, versioned purposes with opt-in/opt-out kind, one current version per purpose) and `PurposeDecision` (the user's current Allowed/Denied decision per purpose, tied to the exact purpose version by a composite foreign key), plus well-known codes in `PurposeCodes`. A decision can be scoped to a single registration, for purposes where one answer per organization is too coarse. `HasSpecialCategoryData` marks purposes covering GDPR article 9 data, which a check constraint keeps opt-in. Database migration required.

Scoping a decision to a registration makes `Registrations.Uuid` the target of a foreign key, and so an alternate key. Its existing unique index is dropped in the same migration rather than kept beside the constraint — two unique indexes on one column cost every write twice and enforce nothing extra. This is the same change `Organizations.Uuid` went through when business events started pointing at it.

`Kind` and `Decision` are also constrained to their defined values. Both enums start at 1 so that an unset field — the default, 0 — is detectable, but a plain integer column stored it without complaint, leaving a purpose that is neither opt-in nor opt-out and a decision that is neither allowed nor denied. Check constraints now make the database refuse it, alongside the one that already keeps special-category purposes opt-in.
