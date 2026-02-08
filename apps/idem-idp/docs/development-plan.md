# Development Plan

## Phase 0 — Documentation & Bootstrap ✅

- Create `apps/idem-idp`
- Add documentation (this folder)
- Lock down architectural decisions
- Security baseline review (completed)
- **ADRs completed**:
  - 0001-0002: Core architectural decisions
  - 0003: Development Shortcuts (added 2026-01-19)
  - 0004-0014: OIDC, security, and operations
  - 0015: Session Management (added 2026-01-19)
  - 0016: IdP Broker Security (added 2026-01-19)
  - 0017: Token Cleanup Monitoring (added 2026-01-19)
- **ADRs updated**:
  - 0002: Environment Model (updated for single-tenant)
  - 0012: Deployment Model (updated for single-tenant)
- **Database Model v2**: Simplified single-tenant schema (40% less complexity)
- **Incident Response Playbook** (added 2026-01-19)

## Phase 1 — Database Foundation

- Create `@idem/db` package
- Configure Drizzle ORM
- Initial migrations (simplified single-tenant schema):
  - **Core**: accounts, identities, emails
  - **Profile**: profile_person, profile_facts, addresses
  - **OAuth**: oauth_clients, keys (JWKS)
  - **IdP Broker**: idp_providers, idp_configs, idp_states, used_id_tokens
  - **OIDC**: oidc_store, express_sessions
  - **Operations**: audit_log, cleanup_runs
  - **Admin**: admin_principals, admin_memberships
- **Security**: Add critical indexes (login flow, token lookup, RBAC)
- **Security**: Configure PostgreSQL-level encryption (TDE)
- Local development seed (ADR 0003)

**Removed from v1**:
- ❌ organizations table (no multi-org)
- ❌ tenants table (no multi-tenancy)
- ❌ org_id / tenant_id columns (simplified)

## Phase 2 — API Skeleton

- Express server bootstrap
- Environment config (static issuer per env, no tenant resolution)
- request-id middleware
- centralized error handler
- Zod-based input validation
- RBAC middleware skeleton (global roles only, no tenant scoping)
- `/healthz` endpoint
- **Security**: Environment guards (fail fast if dev features in prod)
- **Security**: Security headers (Helmet.js - X-Frame-Options, CSP)
- **Security**: HTTPS enforcement configuration
- **Security**: CORS configuration
- **Security**: Redis-backed rate limiting (CRITICAL - must implement before staging)

**Simplified from v1**:
- ❌ No tenant resolution middleware
- ❌ No hostname-based issuer logic
- ✅ Static issuer configuration per environment

## Phase 3 — OIDC Provider

- Integrate node-oidc-provider
- Custom adapter backed by `idem_oidc_store`
- **Static issuer** (no tenant resolution):
  - Dev: `http://localhost:3200`
  - Staging: `https://auth-staging.eventuras.com`
  - Prod: `https://auth.eventuras.com`
- Basic login flow
- **Session Management** (ADR 0015):
  - Express session with PostgreSQL backend (`idem_express_sessions`)
  - Session fixation prevention (regenerate on login)
  - Session hijacking prevention (IP/UA fingerprinting)
  - Absolute session timeout
  - Local logout (revoke sessions + tokens)
- **Security**: Rate limiting on `/token`, `/authorize`, `/userinfo` endpoints
- **Security**: PKCE enforcement for public clients
- **Token Cleanup** (ADR 0017):
  - Daily cleanup job (expired + consumed tokens)
  - Cleanup runs tracking table (`idem_cleanup_runs`)
  - Basic monitoring (table size alerts)
  - Manual cleanup script
- **Security**: Hash client secrets (scrypt, never store plaintext)
- **Security**: Encrypt private keys in database (application-level)

**Simplified from v1**:
- ❌ No per-tenant issuer resolution
- ✅ One static issuer per deployment

## Phase 4 — Admin RBAC

- Admin principals
- **Global roles** (simplified):
  - `system_admin` (full access)
  - `admin_reader` (read-only)
- RBAC middleware (no tenant scoping)
- Minimal admin API
- **Security**: RBAC performance optimization (caching with TTL + invalidation)
- **Security**: Audit logging for all admin actions

**Simplified from v1**:
- ❌ No org_admin, tenant_admin roles
- ❌ No tenant/org scoping
- ✅ Only 2 global roles (down from 5)

## Phase 5 — IdP Broker

- Upstream IdP registry (`idem_idp_providers`)
- **Supported providers**: Vipps, HelseID, Facebook, Google, Discord, GitHub
- **Global IdP configurations** (`idem_idp_configs`):
  - One config per provider (no per-tenant configs)
  - Environment-specific (mock dev, test staging, prod)
- Identity linking
- Error tracking for upstream providers
- **IdP Broker Security** (ADR 0016):
  - State parameter generation + validation (database-backed: `idem_idp_states`)
  - PKCE for ALL IdP flows (mandatory, not optional)
  - Nonce generation + verification
  - Strict redirect URI validation (no wildcards)
  - Token substitution prevention
  - Token replay prevention (`idem_used_id_tokens`)
  - Mix-up attack prevention (provider-specific callbacks)
  - Rate limiting for IdP endpoints
  - IdP-specific security (Vipps, HelseID)
- **Session Management** (ADR 0015):
  - Federated logout (RP-initiated logout)
  - Back-channel logout endpoint
  - Upstream IdP session linking
- **Security**: Encrypt IdP client secrets (scrypt)
- **Security**: State cleanup job (daily)

**Simplified from v1**:
- ❌ No per-tenant IdP configs
- ✅ One config per provider, environment-specific

## Phase 6 — Frontend (Next.js)

- Admin UI
- Interaction / consent UI
- **Static issuer** (no tenant resolution by hostname)
- Environment banner (DEV / STAGING / PROD)
- **Security**: Anti-clickjacking headers (X-Frame-Options: DENY)
- **Security**: CSRF protection for admin forms
- **Security**: Cookie configuration (SameSite, Secure, HttpOnly)

**Simplified from v1**:
- ❌ No tenant resolution
- ❌ No tenant CSS injection concerns
- ✅ Simpler, single branding

## Phase 7 — Developer Tooling

- **Development Shortcuts** (ADR 0003):
  - Mock IdP providers (dev-only): Vipps, HelseID, Facebook, Google, Discord, GitHub
  - Direct token issuance endpoint (`POST /dev/token/issue`)
  - Auto-login via query parameter (`/authorize?dev_login_as=email`)
  - Token introspection UI (`GET /dev/tokens`)
  - Account seeding script (`pnpm dev:seed`)
- Dev-only routes and helpers
- Reset / reseed tooling
- **Security**: Startup validation (fail if dev features in production)
- **Security**: Dev route guards (404 in production, no route leakage)
- **Security**: Build-time validation (tree-shake dev code)

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

- **Security**: Migrate to KMS for private keys (CRITICAL - before production traffic)
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

---

## Architecture Changes Summary (v1 → v2)

### Removed Complexity

- ❌ **Multi-tenancy**: Removed organizations, tenants tables
- ❌ **Tenant scoping**: No tenant_id filtering on queries
- ❌ **Hostname resolution**: Static issuer per environment
- ❌ **Complex RBAC**: Global roles only (2 roles vs 5)
- ❌ **Per-tenant IdP configs**: One config per provider

### Impact

- **Database**: 40% fewer columns (no org_id/tenant_id everywhere)
- **Queries**: 50% simpler (no tenant filtering)
- **Code**: 30-40% less code overall
- **Development time**: 1-2 months saved
- **Maintenance**: Significantly easier debugging

### What We Kept

- ✅ **Environment separation**: Dev/Staging/Prod isolation
- ✅ **IdP brokering**: Vipps, HelseID support
- ✅ **Security features**: All ADRs 0013-0018
- ✅ **OIDC compliance**: Full OAuth 2.0 / OIDC Core support
- ✅ **Audit logging**: Comprehensive audit trail
- ✅ **Admin interface**: Full admin UI and APIs

### Future Multi-Tenancy

If needed later (4-6 weeks effort):
1. Add organizations/tenants tables
2. Add tenant_id to all user-scoped tables
3. Implement tenant resolution (hostname-based)
4. Add tenant scoping to RBAC
5. Split IdP configs per tenant

See ADR 0003 for migration path.
