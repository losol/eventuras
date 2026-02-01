---
"@eventuras/idem-idp": minor
---

Refactor idem-idp: Replace Next.js/Express with Vite/Fastify

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
