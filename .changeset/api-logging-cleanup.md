---
"@eventuras/api": patch
---

Clean up API logging: remove duplicate log output by clearing default providers, and branch /health out of request-logging so liveness probes don't spam the logs.
