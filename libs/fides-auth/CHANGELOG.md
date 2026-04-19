# @eventuras/fides-auth

## 0.5.0

### Minor Changes

- 0783155: feat(oauth): opt-in Pushed Authorization Requests (RFC 9126)

  Adds a `usePar?: boolean` flag on `OAuthConfig` and a low-level
  `buildAuthorizationUrlWithPAR(config, pkceOptions)` helper that mirrors
  `openid-client`'s own API.

  `discoverAndBuildAuthorizationUrl` now routes based on the flag:
  - `usePar: true` + provider advertises `pushed_authorization_request_endpoint` → uses PAR.
  - `usePar: true` + provider does **not** advertise PAR → throws.
  - `usePar` unset/false + provider advertises PAR → standard flow plus a
    one-line `info` log noting PAR is available but not enabled.
  - `usePar` unset/false + no PAR endpoint → standard flow, no advisory.

## 0.4.0

### Minor Changes

- ea5bb15: The default `ConsoleLogger` now emits newline-delimited JSON instead of
  bracket-prefixed text. Output stays interoperable with Loki / Grafana /
  Datadog out of the box even when the consuming app hasn't called
  `configureLogger()` to wire in `@eventuras/logger` or pino.

  Each entry includes `level`, ISO `time`, `namespace`, persistent context
  fields, optional `msg`, and the data object (with `Error` instances
  serialized to `{ name, message, stack }`):

  ```json
  {
    "level": "info",
    "time": "2026-04-15T19:40:57.300Z",
    "namespace": "fides-auth:oauth",
    "msg": "PKCE parameters generated"
  }
  ```

  Apps that still want pretty bracketed output during development should
  plug in their own logger via `configureLogger()` — e.g. wire in
  `@eventuras/logger` and let `configureNodeLogger` from
  `@eventuras/logger/node` handle dev pretty-print.

## 0.3.1

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.3.0

### Minor Changes

- d752b18: ### 🧱 Features
  - feat(fides-auth): add OIDC logout URL builder function (56e010d) [@eventuras/fides-auth]
  - feat(fides-auth): add buildSessionFromTokens function (530c48f) [@eventuras/fides-auth]
  - feat(fides-auth): add exchangeAuthorizationCode function (5187cc4) [@eventuras/fides-auth]

## 0.2.1

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.6.0

## 0.2.0

### Minor Changes

### 🧱 Features

- feat(fides-auth): enhance authentication library with silent login and logging (a96b1f7) [@eventuras/fides-auth]
- feat(fides-auth): build as library (aaf9247) [@eventuras/fides-auth]

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.5.0
