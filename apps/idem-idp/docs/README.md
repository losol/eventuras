# Idem — Identity & Access Platform

This directory contains the canonical documentation for **Idem**,
an OpenID Connect Provider with support for IdP brokering,
administrative configuration, and strict environment isolation.

The documentation consists of:

- Architecture overview
- Canonical database model (TXT)
- Architecture Decision Records (ADRs)
- Incident Response Playbook
- A concrete development plan

ADRs are used to document *why* decisions were made, not just *what*.

## Documentation Index

### Core Documentation

- [Architecture Overview](architecture-overview.md)
- [Database Model v2 (Single-Tenant)](database-model-v2-single-tenant.txt) - Simplified schema with 15 tables (40% less complexity)
- [Database Model v1 (Multi-Tenant)](database-model.txt) - Original schema (DEPRECATED)
- [Development Plan](development-plan.md) - 9-phase implementation roadmap
- [Incident Response Playbook](incident-response-playbook.md) - Security incident procedures

### Architecture Decision Records

**System Architecture (0001-0004):**

- [ADR 0001: System Scope](adr/0001-system-scope.md) - Updated with authentication methods and scope boundaries
- [ADR 0002: Environment Model](adr/0002-environment-model.md)
- [ADR 0003: Development Shortcuts](adr/0003-development-shortcuts.md) ⭐ *New*
- [ADR 0004: Database and ORM](adr/0004-database-and-orm.md)

**OIDC Provider (0005-0007):**

- [ADR 0005: OIDC Provider and Store](adr/0005-oidc-provider-and-store.md)
- [ADR 0006: IdP Broker Model](adr/0006-idp-broker-model.md)
- [ADR 0007: Admin RBAC](adr/0007-admin-rbac.md)

**Implementation Stack (0008-0010):**

- [ADR 0008: Backend Framework](adr/0008-backend-framework.md)
- [ADR 0009: Frontend and Interaction UI](adr/0009-frontend-and-interaction-ui.md)
- [ADR 0010: Dev-only Features and Mock IdP](adr/0010-dev-only-features-and-mock-idp.md)

**Security & Operations (0011-0017):**

- [ADR 0011: Audit and Compliance](adr/0011-audit-and-compliance.md)
- [ADR 0012: Deployment Model](adr/0012-deployment-model.md)
- [ADR 0013: Secrets Management and Encryption](adr/0013-secrets-management.md)
- [ADR 0014: Security Hardening Baseline](adr/0014-security-hardening.md)
- [ADR 0015: Session Management and Logout](adr/0015-session-management.md) ⭐ *New*
- [ADR 0016: IdP Broker Security and Threat Model](adr/0016-idp-broker-security.md) ⭐ *New*
- [ADR 0017: Token Cleanup Job and Monitoring](adr/0017-token-cleanup-monitoring.md) ⭐ *New*

## Recent Updates (2026-01-19)

### Architecture Simplification

Idem has been **simplified to a single-tenant architecture** serving only Eventuras applications:

- **Removed multi-tenancy complexity**: No organizations or tenants tables, 40% fewer columns
- **Static issuer per environment**: One issuer per deployment (dev/staging/prod), no hostname resolution
- **Simplified RBAC**: Global roles only (2 roles vs 5), no tenant scoping
- **Environment-specific IdP configs**: One config per provider (mock dev, test staging, prod)
- **Database Model v2**: Simplified from 17 to 15 tables, removed all `org_id`/`tenant_id` columns

**Impact**: 30-40% less code, 1-2 months faster development, significantly easier debugging and maintenance.

### New Security & Developer Documentation

Four new ADRs and an incident response playbook close critical security gaps:

1. **ADR 0003 - Development Shortcuts**: Mock IdPs, direct token issuance, auto-login query parameter, token introspection UI for fast local development
2. **ADR 0015 - Session Management**: Session fixation prevention, hijacking detection, local/federated logout, back-channel logout
3. **ADR 0016 - IdP Broker Security**: Comprehensive threat model covering state/nonce validation, PKCE, token substitution prevention, mix-up attacks
4. **ADR 0017 - Token Cleanup Monitoring**: Robust cleanup job with health monitoring, Prometheus metrics, alerting, emergency recovery
5. **Incident Response Playbook**: Step-by-step procedures for private key compromise, database breach, upstream IdP compromise, mass token revocation

### Updated Documentation

- **ADR 0001 (System Scope)**: Clarified authentication methods (IdP brokering + OTP), removed multi-tenancy, defined scope boundaries
- **ADR 0002 (Environment Model)**: Single-tenant architecture with dev/staging/prod environments
- **ADR 0012 (Deployment Model)**: One deployment per environment, static issuer configuration
- **Database Model v2**: Completely rewritten for single-tenant (15 tables, 40% less complexity)
- **Development Plan**: All phases updated to reflect simplified architecture
