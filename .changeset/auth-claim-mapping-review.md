---
"@eventuras/api": patch
---

Harden auth claim mapping: `GetRoles()` now reads roles per identity using each identity's `RoleClaimType` (so it respects `Auth:RoleClaimType` instead of a hardcoded claim type), add `RequireScopeHandler` tests covering the issuer-coupled scope claim, and document the claim → usage mapping and Keycloak requirements in `docs/auth-claims.md`.
