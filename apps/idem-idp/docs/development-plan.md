# Development Plan

## Phase 0 — Documentation & Bootstrap
- Create `apps/idem`
- Add documentation (this folder)
- Lock down architectural decisions

## Phase 1 — Database Foundation
- Create `@idem/db` package
- Configure Drizzle ORM
- Initial migrations:
  - organizations
  - tenants
  - oidc_store
- Local development seed

## Phase 2 — API Skeleton
- Express server bootstrap
- request-id middleware
- centralized error handler
- Zod-based input validation
- RBAC middleware skeleton
- `/healthz` endpoint

## Phase 3 — OIDC Provider
- Integrate node-oidc-provider
- Custom adapter backed by `idem_oidc_store`
- Issuer resolution per tenant
- Basic login flow

## Phase 4 — Admin RBAC
- Admin principals
- Role memberships (system / org / tenant)
- RBAC middleware
- Minimal admin API

## Phase 5 — IdP Broker
- Upstream IdP registry
- Per-tenant provider bindings
- Identity linking
- Error tracking for upstream providers

## Phase 6 — Frontend (Next.js)
- Admin UI
- Interaction / consent UI
- Tenant resolution by hostname
- Environment banner (DEV / STAGING / PROD)

## Phase 7 — Developer Tooling
- Mock IdP (dev-only)
- Dev-only routes and helpers
- Reset / reseed tooling

## Phase 8 — Hardening
- Rate limiting
- Cookie and proxy configuration
- Logging hygiene (no secrets/tokens/PII in logs)
- Audit coverage review
