---
"@eventuras/api": minor
---

Add a pending-migrations health check. Reports Degraded (never Unhealthy) when EF Core migrations exist that haven't been applied, surfaced via the admin-only `GET /health/diagnostics` endpoint. Tagged "diagnostics" and excluded from the probe `/health`, so it can never flip the Kubernetes liveness/readiness probes.
