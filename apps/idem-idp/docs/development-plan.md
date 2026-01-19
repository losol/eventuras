# Development Plan

## Phase 0 — Documentation & Bootstrap
- Create `apps/idem`
- Add documentation (this folder)
- Lock down architectural decisions
- Security baseline review (completed)

## Phase 1 — Database Foundation
- Create `@idem/db` package
- Configure Drizzle ORM
- Initial migrations:
  - organizations
  - tenants
  - oidc_store
- **Security**: Add critical indexes (login flow, token lookup, RBAC)
- **Security**: Configure PostgreSQL-level encryption (TDE)
- Local development seed

## Phase 2 — API Skeleton
- Express server bootstrap
- request-id middleware
- centralized error handler
- Zod-based input validation
- RBAC middleware skeleton
- `/healthz` endpoint
- **Security**: Environment guards (fail fast if dev features in prod)
- **Security**: Security headers (Helmet.js - X-Frame-Options, CSP)
- **Security**: HTTPS enforcement configuration
- **Security**: CORS configuration

## Phase 3 — OIDC Provider
- Integrate node-oidc-provider
- Custom adapter backed by `idem_oidc_store`
- Issuer resolution per tenant
- Basic login flow
- **Security**: Rate limiting on `/token`, `/authorize`, `/userinfo` endpoints
- **Security**: PKCE enforcement for public clients
- **Security**: Token cleanup job (expired tokens)
- **Security**: Hash client secrets (bcrypt, never store plaintext)
- **Security**: Encrypt private keys in database (application-level)

## Phase 4 — Admin RBAC
- Admin principals
- Role memberships (system / org / tenant)
- RBAC middleware
- Minimal admin API
- **Security**: RBAC performance optimization (caching)
- **Security**: Audit logging for all admin actions

## Phase 5 — IdP Broker
- Upstream IdP registry
- Per-tenant provider bindings
- Identity linking
- Error tracking for upstream providers
- **Security**: State parameter validation
- **Security**: Nonce verification
- **Security**: Encrypt IdP client secrets (bcrypt)
- **Security**: Rate limiting for IdP callbacks

## Phase 6 — Frontend (Next.js)
- Admin UI
- Interaction / consent UI
- Tenant resolution by hostname
- Environment banner (DEV / STAGING / PROD)
- **Security**: Lock down interaction UI design (prevent tenant CSS injection)
- **Security**: Anti-clickjacking headers (X-Frame-Options: DENY)
- **Security**: CSRF protection for admin forms
- **Security**: Cookie configuration (SameSite, Secure, HttpOnly)

## Phase 7 — Developer Tooling
- Mock IdP (dev-only)
- Dev-only routes and helpers
- Reset / reseed tooling
- **Security**: Startup validation (fail if dev features in production)
- **Security**: Dev route guards (404 in production, no route leakage)

## Phase 8 — Hardening & Pre-Production
- **Security review**: Penetration testing of login flows
- **Security**: Audit log sanitization (redact secrets, tokens, PII)
- **Security**: Database backup strategy
- **Security**: Incident response plan
- **Performance**: Load testing (especially /token endpoint)
- **Compliance**: GDPR checklist (right to erasure, data retention)
- **Monitoring**: Basic observability (structured logging, error tracking)
- Cookie and proxy configuration hardening
- Final audit coverage review

## Phase 9 — Production Preparation (Post-MVP)
- **Security**: Migrate to KMS for private key storage
- **Security**: Column-level encryption for PII (national_id, raw_claims)
- **Performance**: Audit log partitioning strategy
- **Monitoring**: OpenTelemetry integration
- **Scaling**: Multi-region considerations (if needed)
- **Compliance**: Security audit and certification
