---
"@eventuras/idem-idp": minor
---

Implement OIDC Provider Phase 3: Database integration and security

**New Features:**

- Client lookup from database for OIDC authorization flows
- Account lookup with OIDC claims (profile, email scopes)
- Interaction API routes for login and consent flows (`/api/interaction/:uid/*`)

**Breaking Changes:**

- Replaced bcrypt with Node.js built-in scrypt for password hashing
  - Password hash format changed from bcrypt to scrypt
  - Existing hashed passwords need to be regenerated
  - No external dependencies required for password hashing

**Bug Fixes:**

- Added unique constraint to `oidc_store` table for adapter upsert operations
- Fixed client metadata validation (contacts array handling)
- Fixed environment variable loading in test environment
- Fixed NODE_ENV configuration to resolve issuer URL correctly in tests
- Fixed config validation to check correct env var names (IDEM_SESSION_SECRET/IDEM_MASTER_KEY)
- Fixed middleware order: OIDC provider now mounted before body parsers
- Added buffer length validation and error handling to password comparison
- Fixed db.delete() to use returning() for accurate row counts
- DB client now uses centralized config as single source of truth
- Conditionally hide error stack traces in non-development environments

**Migration Required:**

- Run `pnpm db:push` or `pnpm db:migrate` to apply unique constraint on `oidc_store` table
- Migration file: `0001_giant_cloak.sql`
