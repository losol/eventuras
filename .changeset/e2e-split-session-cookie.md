---
'@eventuras/e2e': patch
---

Read the access token from the split `session_at` cookie in the API test helpers — fides-auth 0.7.0 no longer stores it in the main `session` cookie, which broke every authenticated API spec with "No access token found". The legacy single-cookie format still works as a fallback.
