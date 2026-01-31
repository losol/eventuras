# @eventuras/idem-idp

## 0.6.0

### Minor Changes

- 8cd443b: Integrate Next.js with ratio-ui and next-intl for OIDC interaction UI

  **New Features:**
  - Next.js 16 with App Router for server-side rendering
  - next-intl i18n support (Norwegian and English)
  - Interaction UI pages with ratio-ui components (login, consent)
  - Custom server integration (Express + Next.js)
  - Localized authentication flow

  **Technical Details:**
  - Custom server mode: Express handles OIDC/API, Next.js handles UI
  - Middleware for locale detection and routing
  - Client components for interactive authentication flows
  - Proper routing order: health/OIDC first, then body parsers, then Next.js catch-all

  **Testing:**

  Add vitest test suite for OIDC functionality

  Created automated unit/integration tests covering core OIDC functionality:

  **✅ Discovery & JWKS endpoints** (5/5 tests passing)
  - OIDC discovery metadata validation
  - JWKS public key exposure
  - PAR endpoint advertisement
  - PKCE support detection
  - Response type and grant type validation

  **✅ PAR (Pushed Authorization Requests)** - RFC 9126 (3/3 tests passing)
  - PAR endpoint accepts valid requests
  - Request URI generation and format
  - Required parameter validation
  - Security constraints (parameter mixing prevention)

  **✅ Authorization Code Flow with PKCE** (3/3 tests passing)
  - PKCE enforcement (missing verifier rejection) ✅
  - PKCE enforcement (wrong verifier rejection) ✅
  - Redirect URI validation (mismatched URI rejection) ✅

  **✅ Password Hashing** (8/8 tests passing)
  - Scrypt-based password hashing
  - Hash verification
  - Invalid hash handling

  **✅ Server Health** (6/6 tests passing)
  - Server startup and configuration
  - Health check endpoint
  - Static file serving

  **Test Coverage: 26/26 tests passing (100%)**
  - Critical security validations: ✅ All passing
  - Discovery/metadata: ✅ All passing
  - PAR (RFC 9126): ✅ All passing
  - Password hashing: ✅ All passing
  - Server health: ✅ All passing

  **Testing Infrastructure:**
  - vitest for fast test execution
  - supertest for HTTP assertions
  - In-memory test servers on random ports
  - Automated test account creation/cleanup
  - PKCE challenge generation utilities

  **Next Steps:**
  - Playwright E2E tests for full authorization flows with real browser
  - This will test actual UI interactions, consent prompts, and redirect chains

  **Dependencies Added:**
  - next@16.1.4
  - react@^19.2.3
  - react-dom@^19.2.3
  - next-intl@^4.8.1
  - @types/react@19.2.9
  - @types/react-dom@^19.2.3

- 957cee6: Implement OIDC Provider Phase 3 and testing framework

  **New Features:**
  - Client lookup from database for OIDC authorization flows
  - Account lookup with OIDC claims (profile, email scopes)
  - Interaction API routes for login and consent flows (`/api/interaction/:uid/*`)
  - Vitest testing framework with colocated test pattern
  - Public endpoint tests (homepage, health, discovery, JWKS)

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
  - Fixed middleware order: OIDC provider now mounted before body parsers to prevent stream consumption issues
  - Added buffer length validation and error handling to password comparison
  - Fixed db.delete() to use returning() for accurate row counts in adapter and session store
  - DB client now uses centralized config as single source of truth
  - Fixed SessionData type imports in session store
  - Conditionally hide error stack traces in non-development environments
  - Removed unused @types/bcrypt dependency

  **Testing:**
  - 8 password hashing tests (scrypt implementation)
  - 6 public endpoint tests (OIDC discovery, JWKS, health check)
  - All 14 tests passing

  **Migration Required:**
  - Run `pnpm db:push` or `pnpm db:migrate` to apply unique constraint on `oidc_store` table
  - Migration file: `0001_giant_cloak.sql`

### Patch Changes

- Updated dependencies [c32e23c]
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
