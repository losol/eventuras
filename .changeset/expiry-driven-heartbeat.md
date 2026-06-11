---
'@eventuras/fides-auth-next': minor
---

`useHeartbeat` now schedules session refreshes from the access-token expiry
instead of a fixed interval, so the cadence self-adjusts to any token TTL.
Adds `fraction`, `minSkewMs`, `minRefreshIntervalMs` and `initialExpiresAt`
config and decouples `idleThresholdMs` from the token TTL; removes `intervalMs`.
