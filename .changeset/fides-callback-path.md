---
"@eventuras/fides-auth-next": patch
---

Preserve the request path when reconstructing the OIDC callback URL. Behind a TLS-terminating proxy the token-exchange `redirect_uri` collapsed to `/`, causing Keycloak to reject login with `invalid_redirect_uri`.
