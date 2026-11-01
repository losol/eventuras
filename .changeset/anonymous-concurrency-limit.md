---
"@eventuras/api": patch
---

Cap concurrent unauthenticated requests on public endpoints (default 10 per replica or half the DB pool, queue 20, then `429`). Configurable via `RateLimiting__Anonymous__PermitLimit` / `__QueueLimit`.
