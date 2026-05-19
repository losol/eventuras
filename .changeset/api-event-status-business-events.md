---
'@eventuras/api': patch
---

Emit `event.status.changed` business events whenever an event's status changes — both for operator-initiated changes via `EventManagementService.UpdateEventAsync` and for the auto-close triggered by `CreateRegistrationAsync` reaching `MaxParticipants`. Each event records the acting user and the from→to transition.
