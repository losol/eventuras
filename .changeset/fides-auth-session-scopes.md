---
"@eventuras/fides-auth": minor
---

Surface granted scopes as a first-class field on `Session`.

- Added `scopes?: string[]` to the `Session` interface in `types.ts`
- `buildSessionFromTokens` now populates `session.scopes` by splitting the space-separated `tokens.scope` string (empty/missing scope leaves the field `undefined`)
- Added `hasScope(session, scope)` convenience helper in `utils.ts`

Backwards-compatible — `scopes` is optional and existing consumers compile and run unchanged.
