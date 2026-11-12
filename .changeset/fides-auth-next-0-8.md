---
"@eventuras/web": patch
---

Upgrade `@eventuras/fides-auth-next` to 0.8.0. The session helpers and the login, callback, logout and heartbeat routes now come from one `createFidesAuth` instance bound to `SESSION_SECRET` and the OIDC config, instead of reading the secret from the environment inside the library. Existing sessions stay valid; `SESSION_SECRET` is still 64 hex characters.
