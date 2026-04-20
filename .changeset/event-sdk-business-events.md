---
"@eventuras/event-sdk": minor
"@eventuras/api": minor
---

feat: `GET /v3/business-events` endpoint

New admin-only endpoint and corresponding SDK client for listing
business events (audit log) for a given subject within the current
organization.

- `getV3BusinessEvents(...)` — fetches paged `BusinessEventDto[]`.
- Query: `?subjectType=order|registration|user&subjectUuid={guid}&page=1&count=50`.
- Gated server-side by role **and** membership: org admins can only
  read their own organisation's events, system admins can read any.
  The new `IBusinessEventAccessControlService` is invoked from inside
  `BusinessEventService.ListEventsAsync`, so every future caller of
  the service inherits the same enforcement.
- Org resolved from `Eventuras-Org-Id` / `?orgId` / hostname; a caller
  cannot silently read another tenant by flipping the header because
  the membership check fails.
