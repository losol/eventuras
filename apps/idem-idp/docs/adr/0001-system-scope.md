# ADR 0001 — System Scope

## Status
Accepted

## Context
Eventuras requires a centralized identity platform to support authentication, authorization,
and identity brokering across services.

## Decision
We will build **Idem** as a standalone OpenID Connect Provider with:

- Multi-organization support
- Multi-tenant issuers
- IdP brokering
- Administrative APIs and UI

Idem is not a general IAM product; it is a focused platform for Eventuras and closely related services.

## Consequences
- Idem can evolve independently of consuming applications
- Security and compliance concerns are centralized
