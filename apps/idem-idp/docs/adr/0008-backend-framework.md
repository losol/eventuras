# ADR 0008 — Backend Framework

## Status
Accepted

## Context
The team already uses Express in other projects and values consistency over introducing a new framework.

## Decision
Use **Express** for the backend API, with a strict baseline:
- request-id propagation
- Zod-based request validation
- centralized error handling
- RBAC middleware
- environment guards for dev-only routes

## Consequences
- Lower cognitive overhead
- Easy integration with node-oidc-provider patterns
- Future migration remains possible (clear HTTP boundary)
