---
'@eventuras/api': patch
---

Block self-service registration when an event has reached `MaxParticipants`, and flip the event to `RegistrationsClosed` (not `WaitingList`) when the filling registration is created. Admins keep the manual-overbook path via `EnforceCapacity = false`.
