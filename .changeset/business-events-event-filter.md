---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

`GET /v3/business-events` accepts `eventInfoUuid` as an alternative to `subjectType` + `subjectUuid`, returning everything recorded on one event — the event itself, its registrations and their orders — newest first. The event is resolved from the domain tables, so nothing new is stored on the audit records and history is covered. Exactly one selector is required.
