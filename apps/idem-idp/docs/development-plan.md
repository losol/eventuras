# Development Plan

## Phase 0 — Documentation & Bootstrap ✅

- Create `apps/idem`
- Add documentation (this folder)
- Lock down architectural decisions
- Security baseline review (completed)
- **ADRs completed**:
  - 0001-0014: Core architectural decisions
  - 0015: Session Management (added 2026-01-19)
  - 0016: IdP Broker Security (added 2026-01-19)
  - 0017: Token Cleanup Monitoring (added 2026-01-19)
- **Incident Response Playbook** (added 2026-01-19)

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
- **Security**: Redis-backed rate limiting (CRITICAL - must implement before staging)

## Phase 3 — OIDC Provider

- Integrate node-oidc-provider
- Custom adapter backed by `idem_oidc_store`
- Issuer resolution per tenant
- Basic login flow
- **Session Management** (ADR 0015):
  - Express session with PostgreSQL backend
  - Session fixation prevention (regenerate on login)
  - Session hijacking prevention (IP/UA fingerprinting)
  - Absolute session timeout
  - Local logout (revoke sessions + tokens)
- **Security**: Rate limiting on `/token`, `/authorize`, `/userinfo` endpoints
- **Security**: PKCE enforcement for public clients
- **Token Cleanup** (ADR 0017):
  - Daily cleanup job (expired + consumed tokens)
  - Cleanup runs tracking table
  - Basic monitoring (table size alerts)
  - Manual cleanup script
- **Security**: Hash client secrets (bcrypt, never store plaintext)
- **Security**: Encrypt private keys in database (application-level)

## Phase 4 — Admin RBAC

- Admin principals
- Role memberships (system / org / tenant)
- RBAC middleware
- Minimal admin API
- **Security**: RBAC performance optimization (caching with TTL + invalidation)
- **Security**: Audit logging for all admin actions

## Phase 5 — IdP Broker

- Upstream IdP registry
- Per-tenant provider bindings
- Identity linking
- Error tracking for upstream providers
- **IdP Broker Security** (ADR 0016):
  - State parameter generation + validation (database-backed, not cookie)
  - PKCE for ALL IdP flows (mandatory, not optional)
  - Nonce generation + verification
  - Strict redirect URI validation (no wildcards)
  - Token substitution prevention
  - Token replay prevention (ID token hash storage)
  - Mix-up attack prevention (provider-specific callbacks)
  - Rate limiting for IdP endpoints
  - IdP-specific security (Vipps, HelseID, ID-porten, Azure AD, Google, GitHub)
- **Session Management** (ADR 0015):
  - Federated logout (RP-initiated logout)
  - Back-channel logout endpoint
  - Upstream IdP session linking
- **Security**: Encrypt IdP client secrets (bcrypt)
- **Security**: State cleanup job (daily)

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
- **Security**: Penetration testing of IdP broker flows (CRITICAL - ADR 0016)
- **Security**: Audit log sanitization (redact secrets, tokens, PII)
- **Security**: Audit log partitioning (100K threshold, not 1M)
- **Security**: Database backup strategy
- **Incident Response**:
  - Incident response playbook (completed)
  - Test key rotation procedure (tabletop exercise)
  - Test database credential rotation
  - Test mass token revocation
  - Test upstream IdP failure handling
- **Token Cleanup Monitoring** (ADR 0017):
  - Prometheus metrics export
  - Grafana dashboards
  - Alerting rules (PagerDuty/Opsgenie)
  - Health check integration
- **Session Management Hardening** (ADR 0015):
  - IP/UA fingerprinting (optional strict mode)
  - Absolute session timeout enforcement
  - Session hijacking detection logging
- **Performance**: Load testing (especially /token endpoint)
- **Compliance**: GDPR checklist (right to erasure, data retention)
- **Monitoring**: Basic observability (structured logging, error tracking)
- Cookie and proxy configuration hardening
- Final audit coverage review

## Phase 9 — Production Preparation (Post-MVP)

- **Security**: Migrate to KMS for private key storage (CRITICAL - before production traffic)
- **Security**: Column-level encryption for PII (national_id, raw_claims)
- **Performance**: Audit log partitioning (monthly from day 1)
- **Monitoring**: OpenTelemetry integration
- **Operational Readiness**:
  - On-call rotation (minimum 2 engineers)
  - Runbooks for common incidents
  - 24/7 monitoring and alerting
  - Disaster recovery testing (quarterly)
  - Key rotation drills (quarterly)
- **Scaling**: Multi-region considerations (if needed)
- **Compliance**: External security audit and certification
