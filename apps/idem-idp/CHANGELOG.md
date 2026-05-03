# @eventuras/idem-idp

## 0.7.17

### Patch Changes

- Updated dependencies [991b508]
- Updated dependencies [745a994]
- Updated dependencies [b399eb5]
  - @eventuras/ratio-ui@2.2.0

## 0.7.16

### Patch Changes

- Updated dependencies [2842f02]
  - @eventuras/ratio-ui@2.1.0

## 0.7.15

### Patch Changes

- da8ba03: Self-host the brand fonts (Source Serif 4 + Source Sans 3) and drop the Google Fonts CDN dependency.

  The fonts ship as variable WOFF2 in the published package, both axes (weight 200–900 + italic) covered. They're exposed as a separate opt-in stylesheet so the bundler keeps them as files rather than inlining them into the main CSS.

  ```ts
  // In your root layout — once
  import "@eventuras/ratio-ui/ratio-ui.css";
  import "@eventuras/ratio-ui/fonts.css"; // new — adds Source Serif 4 + Source Sans 3
  ```

  Without the `fonts.css` import, the type tokens fall back to the system serif/sans stack defined in `tokens/typography.css` (`ui-serif, Georgia, serif` etc.). Existing apps using the Google Fonts CDN behavior will silently fall back to system fonts after upgrading without the new import.

  All apps in this repo (`apps/web`, `apps/historia`, `apps/idem-admin`, `apps/idem-idp`, `apps/dev-docs`) have been migrated to add the `fonts.css` import.

  ### License

  Source Serif 4 and Source Sans 3 are licensed under the SIL Open Font License 1.1. The full license text and copyright notices are bundled with the fonts at `src/fonts/OFL.txt` and ship with the published package.

  ### WOFF2

  The fonts are shipped as WOFF2 (variable). WOFF2 is supported in 97%+ of browsers and is roughly 60–75% smaller than the original variable TTFs (~1 MB total vs ~3 MB). The four files are roughly 137 KB / 168 KB (Sans italic / roman) and 343 KB / 424 KB (Serif italic / roman).

  ### Why a separate import

  Vite's library mode + Tailwind v4's CSS pipeline inline all `@font-face url()` references as base64 data URLs by default, which would have ballooned the bundled `ratio-ui.css`. Shipping `fonts.css` as a hand-written file outside the Vite bundle keeps the URLs intact, lets the consumer's bundler resolve them as separate cacheable assets, and keeps the main CSS small.

- Updated dependencies [c42ceff]
- Updated dependencies [90b83f5]
- Updated dependencies [9056263]
- Updated dependencies [f193007]
- Updated dependencies [0c33e7e]
- Updated dependencies [b2073e2]
- Updated dependencies [439d1bc]
- Updated dependencies [8d120ff]
- Updated dependencies [23bffe4]
- Updated dependencies [0026040]
- Updated dependencies [811526d]
- Updated dependencies [8c058ec]
- Updated dependencies [212c407]
- Updated dependencies [6b4dc48]
- Updated dependencies [4df1e9b]
- Updated dependencies [67da869]
- Updated dependencies [22c3761]
- Updated dependencies [d2e3286]
- Updated dependencies [9e1c5e9]
- Updated dependencies [18c0976]
- Updated dependencies [2205b54]
- Updated dependencies [38f2ec7]
- Updated dependencies [47dc304]
- Updated dependencies [c403912]
- Updated dependencies [3522c1e]
- Updated dependencies [2382fb5]
- Updated dependencies [5775e95]
- Updated dependencies [2c509b0]
- Updated dependencies [71d4644]
- Updated dependencies [da8ba03]
- Updated dependencies [e941cf7]
- Updated dependencies [59474a4]
- Updated dependencies [294e31f]
- Updated dependencies [5220555]
- Updated dependencies [59fd88b]
- Updated dependencies [d86894a]
- Updated dependencies [a29b507]
  - @eventuras/ratio-ui@2.0.0
  - @eventuras/fides-auth@0.7.0
  - @eventuras/mailer@0.1.2
  - @eventuras/notitia-templates@0.2.4
  - @eventuras/logger@0.8.1

## 0.7.14

### Patch Changes

- Updated dependencies [7caaea2]
  - @eventuras/fides-auth@0.6.0

## 0.7.13

### Patch Changes

- Updated dependencies [135e60e]
- Updated dependencies [521eb30]
  - @eventuras/ratio-ui@1.3.0

## 0.7.12

### Patch Changes

- Updated dependencies [0783155]
- Updated dependencies [b5de2d6]
- Updated dependencies [6dbc23a]
  - @eventuras/fides-auth@0.5.0
  - @eventuras/ratio-ui@1.2.0

## 0.7.11

### Patch Changes

- Updated dependencies [839913f]
- Updated dependencies [0ec59ba]
  - @eventuras/ratio-ui@1.1.1

## 0.7.10

### Patch Changes

- Updated dependencies [161ee7b]
  - @eventuras/ratio-ui@1.1.0

## 0.7.9

### Patch Changes

- Updated dependencies [3543c98]
- Updated dependencies [ea5bb15]
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/ratio-ui@1.0.4
  - @eventuras/fides-auth@0.4.0
  - @eventuras/logger@0.8.0

## 0.7.8

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/fides-auth@0.3.1
  - @eventuras/logger@0.7.1
  - @eventuras/mailer@0.1.1
  - @eventuras/notitia-templates@0.2.3
  - @eventuras/ratio-ui@1.0.3

## 0.7.7

### Patch Changes

- Updated dependencies [e0b00a9]
  - @eventuras/ratio-ui@1.0.2

## 0.7.6

### Patch Changes

- Updated dependencies [e073558]
- Updated dependencies [b3d101f]
  - @eventuras/ratio-ui@1.0.1
  - @eventuras/notitia-templates@0.2.2

## 0.7.5

### Patch Changes

- Updated dependencies [6e7d2d4]
- Updated dependencies [abaa171]
- Updated dependencies [202f819]
- Updated dependencies [7b0c54c]
  - @eventuras/logger@0.7.0
  - @eventuras/ratio-ui@1.0.0

## 0.7.4

### Patch Changes

- Updated dependencies [d5634da]
  - @eventuras/ratio-ui@0.14.1

## 0.7.3

### Patch Changes

- Updated dependencies [bbb9111]
- Updated dependencies [0e1796e]
  - @eventuras/ratio-ui@0.14.0

## 0.7.2

### Patch Changes

- Updated dependencies [d752b18]
- Updated dependencies [0b4b869]
  - @eventuras/fides-auth@0.3.0
  - @eventuras/ratio-ui@0.13.0

## 0.7.1

### Patch Changes

- Updated dependencies [fce9a48]
- Updated dependencies [cc205db]
- Updated dependencies [21d0d6f]
  - @eventuras/ratio-ui@0.12.0

## 0.7.0

### Minor Changes

- 481dbcc: ### 🧱 Features
  - feat(idem-idp): implement per-client RBAC system and remove legacy system_role column (b1118d7) [@eventuras/idem-idp]
  - feat(idem-idp): adds rbac and client roles (fe254b4) [@eventuras/idem-idp]

  ♻️ Refactoring
  - refactor(idem-idp): simplify bootstrap and seed (5db1758) [@eventuras/idem-idp]

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
