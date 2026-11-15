---
"@eventuras/web": minor
"@eventuras/e2e": patch
---

Move to `@eventuras/fides-auth` 1.0 (beta). Everyone logs in again once after the deploy, since 1.0 doesn't read 0.x sessions; roll out all replicas at once. The proxy now refreshes the session before a page, action or route renders, so pages no longer refresh tokens themselves. The browser asks the new `/api/auth/session` endpoint, which replaces `/api/auth/status`. The e2e helpers read the access token with fides-auth itself instead of decrypting the cookie.
