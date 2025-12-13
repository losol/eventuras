# ADR 0005 — OIDC Provider and Store

## Status
Accepted

## Context
OIDC flows require durable storage for tokens, sessions, authorization codes, and PAR state.

## Decision
- Use **node-oidc-provider** as the OIDC engine.
- Implement a custom adapter backed by a single table: `idem_oidc_store`.
- Extract common fields (`client_id`, `account_id`, `grant_id`, `session_id`, `scope`, etc.)
  to support revocation, logout fan-out, analytics, and operational queries.

## Consequences
- Full control over token lifecycle and indexing
- Simplified schema compatible with node-oidc-provider adapter API
