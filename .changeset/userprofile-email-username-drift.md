---
"@eventuras/api": patch
---

Fix `GET /v3/userprofile` returning HTTP 500 (`duplicate key value violates unique constraint "AspNetUsers_NormalizedUserName_key"`) for users whose stored email had drifted from their username. The get-or-create now resolves users by normalized email **or** username, realigns a drifted email when safe, and recovers from concurrent first-time request races instead of failing.
