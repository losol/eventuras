---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

`POST /v3/processing-purposes` lets a system admin create a processing purpose in the current organization, such as `marketing.newsletter` as a reservation. It creates version 1 of a new code; a code the organization already uses, retired versions included, is a conflict, and a purpose covering special category data must be a consent. Organization admins keep read access through `GET /v3/processing-purposes`.
