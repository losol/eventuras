# ADR 0006 — IdP Broker Model

## Status
Accepted

## Context
Users may authenticate via multiple external identity providers (Vipps, HelseID, ID-porten, etc.).

## Decision
- Model upstream IdPs explicitly in the database (`idem_idp_providers`).
- Bind providers per tenant with separate credentials (`idem_idp_provider_tenants`).
- Use `idem_identities` to link upstream identities to local accounts.
- Track upstream failures in provider bindings to improve operational robustness.

## Consequences
- Consistent broker pipeline across providers
- Environment differences are handled by tenant-scoped bindings
- Better observability and resilience for upstream outages/misconfigurations
