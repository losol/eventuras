# ADR 0009 — Frontend and Interaction UI

## Status
Accepted

## Context
OIDC login and consent flows require user-facing UI. Admin configuration also needs a UI.

## Decision
- Use **Next.js** for frontend.
- Host both **Admin UI** and **Interaction/Consent UI** in the same Next app.
- Separate them via route groups:
  - admin area
  - interaction area

Prefer serving frontend and backend under the same host in production to simplify cookies and SameSite behavior.

## Consequences
- Faster UI iteration
- Cleaner separation between admin and interaction concerns
- Fewer cross-origin cookie issues
