# ADR 0003 — Multi-Organization and Multi-Tenant Model

## Status
Accepted

## Context
Different organizations may require isolated identity domains, and each organization may operate multiple environments.

## Decision
- An **Organization** represents a legal or administrative entity.
- A **Tenant** represents an OIDC issuer.
- Tenants belong to exactly one organization.
- Tenants have an environment (`development`, `staging`, `production`).
- Tenants are resolved primarily by **hostname**, not by URL path.

## Consequences
- Strong isolation between issuers
- Clear ownership and governance boundaries
