# @eventuras/idem-idp

## 0.6.0

### Minor Changes

- 8cd443b: Refactor idem-idp: Replace Next.js/Express with Vite/Fastify

  **Architecture Changes:**
  - Replaced Next.js with Vite for interaction UI (simpler, faster builds)
  - Replaced Express with Fastify for better performance and TypeScript support
  - Separated dashboard into standalone app (`idem-admin`)

  **New Features:**
  - Interaction UI with ratio-ui components (login, consent)
  - Localized authentication flow (Norwegian and English)
  - Configurable locale and app name
  - Email OTP authentication
  - Enhanced OTP flow with session management

  **Technical Details:**
  - Fastify handles OIDC/API routes
  - Static Vite build served for interaction UI
  - Drizzle session store migrated to Fastify
  - Improved error handling with structured responses

  **Breaking Changes:**
  - Session table renamed from `express_sessions` to `sessions`
  - Migration required: `0002_rename-express-sessions-to-sessions.sql`

  **Testing:**

  Vitest test suite for OIDC functionality:
  - Discovery & JWKS endpoints (5/5 tests)
  - PAR (Pushed Authorization Requests) - RFC 9126 (3/3 tests)
  - Authorization Code Flow with PKCE (3/3 tests)
  - Password Hashing with scrypt (8/8 tests)
  - Server Health (6/6 tests)

  **Test Coverage: 26/26 tests passing (100%)**

- 957cee6: Implement OIDC Provider Phase 3: Database integration and security

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

### Patch Changes

- Updated dependencies [c32e23c]
- Updated dependencies [39bd56b]
- Updated dependencies [c32e23c]
  - @eventuras/ratio-ui@0.11.0

## 0.5.2

### Patch Changes

- chore: update deps

## 0.5.1

### Patch Changes

- chore: update dependencies across frontend packages

## 0.5.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - chore(idem): bump version (9921f20)
  - ci(idem): multiarch build (9d10a61)
  - fix(idem): correct package version (fe9f972)
  - ci(idem): adds ci for docker (423402b)
  - feat(idem-idp): add new Idem IDP app with basic Express server setup (b34e52a)
