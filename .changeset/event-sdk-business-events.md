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
- Gated server-side with `AdministratorRole`; org is resolved from
  `Eventuras-Org-Id` / `?orgId` / hostname (not caller-supplied in
  the query), so an admin can only read events for the organization
  they are already acting in.
