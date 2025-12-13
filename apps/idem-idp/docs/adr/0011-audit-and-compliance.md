# ADR 0011 — Audit and Compliance

## Status
Accepted

## Context
Administrative and security-sensitive actions must be traceable for compliance, incident response, and debugging.

## Decision
- Introduce an immutable audit log (`idem_audit_log`).
- Store structured state (`before`, `after`) as JSONB where useful.
- Include a short human-readable `message` for operators and auditors.
- Avoid logging secrets, tokens, or sensitive PII in audit or application logs.

## Consequences
- Improved compliance posture
- Easier debugging and incident analysis
