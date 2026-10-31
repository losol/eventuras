---
"@eventuras/api": patch
---

Cap the Npgsql connection pool per replica (default 20, configurable via `Database__MaxPoolSize` / Helm `database.maxPoolSize`; the lowest explicit value wins).
