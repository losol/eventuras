---
"@eventuras/fides-auth": minor
---

Type `tokens.accessTokenExpiresAt` / `tokens.refreshTokenExpiresAt` as ISO 8601 `string` instead of `Date`. The session is a JSON/JWT envelope, so these values are always strings on the wire — the `Date` type was a lie after a `validateSessionJwt` round-trip. Consumers doing date math should wrap in `new Date(value)`.
