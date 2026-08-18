---
'@eventuras/web': patch
---

Stop logging users out while their session is still refreshable: upgrade `@eventuras/fides-auth-next` to 0.7.0 (expired access token + live refresh token now means "refresh", not "log in again"), make the proxy validation-only so it cannot burn a rotated refresh token, report expired-but-refreshable as authenticated from the status route, and adopt POST-only logout with `id_token_hint`. Auth paths now log the library's `session.*` event vocabulary with `sid` for correlation.
