---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

Users can see and set their own decisions on processing purposes, so an existing customer can reserve themselves against marketing (`marketing.newsletter`).

- `GET /v3/userprofile/purposes` lists the current organization's current purposes with the signed-in user's organization-wide decision and what it amounts to: `mayProcess` is the value to enforce, `mustAsk` flags an unanswered or expired consent.
- `PUT /v3/userprofile/purposes/{code}` records `Allowed` or `Denied` on the current version. Every change is logged as a `purpose.decision.changed` business event on the user; repeating the same answer is not. 404 when the organization has no current purpose with the code.
