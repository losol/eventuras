# ADR 0012 — Deployment Model

## Status
Accepted

## Context
OIDC issuers, keys, cookies, and upstream credentials must never be shared across environments.

## Decision
- Use separate deployments for **development**, **staging**, and **production**.
- Use separate databases per environment.
- Use separate issuers (distinct hostnames) per environment.
- Deploy frontend and backend together per environment (same host) where feasible.

## Consequences
- Strong isolation
- Predictable behavior across environments
- Lower risk of misconfiguration causing cross-environment leakage
