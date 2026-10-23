---
'@eventuras/api': minor
'@eventuras/event-sdk': minor
---

Events can be read, updated, patched and deleted by UUID, next to the existing integer routes: `GET`, `PUT`, `PATCH` and `DELETE /v3/events/{uuid}`. They behave like the integer routes, except that an unknown UUID gives 404 on delete as well.
