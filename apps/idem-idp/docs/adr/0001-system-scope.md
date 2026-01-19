# ADR 0001 — System Scope

## Status

Accepted

## Context

Eventuras requires a centralized identity platform to support authentication, authorization, and identity brokering across applications.

## Decision

We will build **Idem** as a standalone OpenID Connect Provider with:

- **Single-tenant architecture**: One deployment per environment (dev/staging/prod)
- **IdP brokering**: Vipps, HelseID integration for federated authentication
- **OTP authentication**: Passwordless login via SMS/Email one-time passwords
- **Administrative APIs and UI**: User management, OAuth client configuration
- **Three environments**: Development (local with mocks), Staging (test IdPs), Production (live IdPs)

Idem is not a general IAM product; it is a focused platform for Eventuras applications only.

### Authentication Methods

**Supported:**

- ✅ **IdP brokering** (Vipps, HelseID) - Primary method for Norwegian identity verification
- ✅ **Social login** (Facebook, Google, Discord, GitHub) - Federated authentication for broader accessibility
- ✅ **OTP via SMS/Email** - Passwordless authentication
- ✅ **Multiple identities per account** - Users can link multiple login methods (e.g., Vipps + Google + OTP) to one account

**Not Supported:**

- ❌ Username/password authentication (security risk, password management overhead)
- ❌ Magic links (use OTP instead)

### Scope Boundaries

**In Scope:**

- OIDC Provider (authorization code flow, token issuance, refresh tokens)
- IdP broker for upstream identity providers (Vipps, HelseID, Facebook, Google, Discord, GitHub)
- Social login (Facebook, Google, Discord, GitHub)
- OTP-based passwordless authentication
- **Identity linking**: Users can link multiple authentication methods to one account
  - Example: User logs in with Vipps, later adds Google login to same account
  - Primary identity + multiple linked identities per account
  - Account merging when user logs in with different IdP but same verified email
- User account management
- OAuth client registration and management
- Admin RBAC (2 global roles: system_admin, admin_reader)
- Session management and logout (local + federated)
- Self-service user registration (users can create accounts via social login or OTP)
- Audit logging

**Out of Scope:**

- Multi-tenancy (Idem serves only Eventuras applications)
- Additional social providers beyond the 6 supported
- SAML support (OIDC/OAuth only)
