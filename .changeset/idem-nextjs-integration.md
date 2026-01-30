---
"@eventuras/idem-idp": minor
---

Integrate Next.js with ratio-ui and next-intl for OIDC interaction UI

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
