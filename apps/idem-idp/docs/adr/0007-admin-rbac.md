# ADR 0007 — Admin RBAC

## Status
Accepted

## Context
Administrative access must be strictly controlled and scoped to organizations or tenants.

## Decision
Introduce explicit RBAC with roles:
- `system_admin` (global)
- `org_admin` (organization-scoped)
- `tenant_admin` (tenant-scoped)
- optional read-only roles later (`org_reader`, `tenant_reader`)

Model:
- `idem_admin_principals` identifies the admin actor (human or service).
- `idem_admin_memberships` grants roles at scopes (global/org/tenant).

Authorization is performed at request time via DB lookups, not static token claims.

## Consequences
- Clear governance boundaries
- Supports “dev-only admin” as `tenant_admin` on development tenants
- Strong auditability and reversibility of access grants
