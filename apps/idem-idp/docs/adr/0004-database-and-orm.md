# ADR 0004 — Database and ORM: SQL-first for the security core

## Status
Accepted

## Context
The system handles security-critical state (tokens, sessions, keys) and requires transparency and control over persistence.
The team prefers model-driven development in many areas but wants minimal risk in the “security core”.

## Decision
- Use **PostgreSQL** as the only database.
- Use **Drizzle ORM** for schema and migrations.
- Adopt **SQL-first** posture for the security core:
  - constraints and indexes are explicit
  - migrations are reviewed as infrastructure code
- Adopt **model-first** posture in domain/application code:
  - domain models do not depend on Drizzle types
  - database is accessed behind repositories/interfaces

## Consequences
- Predictable behavior for token/session persistence
- Clear review surface for schema and indexes
- Domain logic remains portable and testable
