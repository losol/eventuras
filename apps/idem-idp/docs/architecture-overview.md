# Architecture Overview

Idem is a standalone identity platform providing:

- OpenID Connect Provider (OIDC issuer)
- IdP brokering (Vipps, HelseID, ID-porten, AzureAD, etc.)
- Administrative APIs and UI
- Multi-organization and multi-tenant support
- Strong isolation between environments

## High-level components

- **Backend API**
  - Express
  - node-oidc-provider
  - PostgreSQL
  - Drizzle ORM

- **Frontend**
  - Next.js
  - Admin UI
  - OIDC interaction / consent UI

- **Database**
  - PostgreSQL
  - SQL-first schema
  - JSONB for OIDC state

## Key principles

- Explicit environment separation (dev / staging / prod)
- SQL-first for the security core
- Strong auditability
- Clear separation between domain, application, and infrastructure
