---
'@eventuras/fides-auth': patch
---

Fix `exchangeAuthorizationCode` to normalize the callback URL origin to `oauthConfig.redirect_uri` before invoking the token-exchange. `openid-client` derives `redirect_uri` from the passed callback URL (via `stripParams`), overriding the explicit option — so when a consumer sits behind a reverse proxy that doesn't forward the original scheme (e.g. `@react-router/serve` without trust-proxy), PAR sent `https://...` but token-exchange sent `http://...` and the IdP rejected the mismatch.
