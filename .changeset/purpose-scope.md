---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

Processing purposes get a `scope`: `Organization` (the default, and what every existing purpose becomes) or `Registration`, for purposes decided separately for each registration. `POST /v3/processing-purposes` accepts it and the DTO returns it. `GET /v3/userprofile/purposes` lists only organization-scoped purposes, and `PUT /v3/userprofile/purposes/{code}` answers 400 for a registration-scoped one.
