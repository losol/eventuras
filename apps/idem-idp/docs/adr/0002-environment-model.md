# ADR 0002 — Environment Model

## Status
Accepted

## Context
The system must clearly separate development, staging, and production while still allowing
developer-friendly workflows in development.

## Decision
Introduce a canonical environment variable:

`IDEM_ENV = development | staging | production`

This variable is the single source of truth for:
- enabling dev-only features
- environment-specific policy
- tenant loading rules

`NODE_ENV` is not used for domain logic.

## Consequences
- Dev-only features are hard to activate accidentally in staging/production
- Environment intent is explicit and auditable
