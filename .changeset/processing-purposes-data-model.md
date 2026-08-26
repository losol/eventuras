---
'@eventuras/api': minor
---

Data model for processing purposes and user decisions: `ProcessingPurpose` (immutable, versioned purposes with opt-in/opt-out kind, one current version per purpose) and `PurposeDecision` (the user's current Allowed/Denied decision per purpose, tied to the exact purpose version by a composite foreign key), plus well-known codes in `PurposeCodes`. A decision can be scoped to a single registration, for purposes where one answer per organization is too coarse. `HasSpecialCategoryData` marks purposes covering GDPR article 9 data, which a check constraint keeps opt-in. Database migration required.
