---
"@eventuras/fides-auth": minor
---

feat(oauth): opt-in Pushed Authorization Requests (RFC 9126)

Adds a `usePar?: boolean` flag on `OAuthConfig` and a low-level
`buildAuthorizationUrlWithPAR(config, pkceOptions)` helper that mirrors
`openid-client`'s own API.

`discoverAndBuildAuthorizationUrl` now routes based on the flag:

- `usePar: true` + provider advertises `pushed_authorization_request_endpoint` → uses PAR.
- `usePar: true` + provider does **not** advertise PAR → throws.
- `usePar` unset/false + provider advertises PAR → standard flow plus a
  one-line `info` log noting PAR is available but not enabled.
- `usePar` unset/false + no PAR endpoint → standard flow, no advisory.
