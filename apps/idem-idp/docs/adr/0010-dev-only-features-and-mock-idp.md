# ADR 0010 — Dev-only Features and Mock IdP

## Status
Accepted

## Context
Developers need fast feedback loops without depending on real upstream IdPs.

## Decision
- Provide a mock upstream provider (e.g. `vipps_mock`) in the same broker model.
- Dev-only behavior is guarded by `IDEM_ENV === "development"` and an explicit allow flag.
- Dev-only routes live under `/__dev/*` and are not mounted outside development.

## Consequences
- High developer productivity
- Reduced risk of “test hacks” leaking into staging or production
