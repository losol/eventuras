---
'@eventuras/web': patch
---

Removes `utils/api/functions/events.ts`, an unused second copy of the event registration flow. Nothing imported it, and it still created registrations before adding products, the ordering that left confirmation emails listing only the mandatory ones. Its folder README went with it: it documented a forwarder route, an `apiFetch` helper and `ApiURLs`, none of which exist any more.
