---
'@eventuras/api': minor
---

Data model for processing purposes and user decisions: `ProcessingPurpose` (immutable, versioned purposes with opt-in/opt-out kind, one current version per purpose) and `PurposeDecision` (the user's current Allowed/Denied decision per purpose, tied to the exact purpose version by a composite foreign key), plus well-known codes in `PurposeCodes`. Database migration required.
