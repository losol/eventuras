# @eventuras/web

## 3.0.0

### Major Changes

- 24e71c6: ### v3.0 — Port to API project v3 and event-sdk v3

  #### Identity and user IDs
  - User IDs are now UUIDs (`string`) instead of `number`. Every signature,
    comparison, mapper, and React prop that previously treated `userId` as
    numeric has been updated. Affects registration flows, admin participant
    lists, event editor, and API mappers.
  - `getV3UsersMe` replaced with `getV3Userprofile` (renamed in API v3).

  #### SDK type and export changes
  - `*DtoPageResponseDto` types renamed to `PageResponseDtoOf*` to match the
    regenerated SDK.
  - `RegistrationType` and `RegistrationStatus` are now type-only exports;
    runtime enum-style usage replaced with string literals.
  - Nullable fields now arrive as `string | null` instead of `string | undefined`;
    call sites updated accordingly.
  - `isolatedModules`-safe re-exports (`export type`) where the SDK types flow
    through `lib/eventuras-types.ts`.

  #### Removed fields
  - `order.log` removed — the field is no longer part of the `Order` DTO. The
    admin order actions menu no longer renders log history (superseded by the
    new `BusinessEvents` stream).
  - `externalRegistrationsUrl` form field removed from the event editor. The
    API now hardcodes this to an empty string and ignores any input, so the
    corresponding `TextField` has been dropped.

### Patch Changes

- b1d298f: Add "Other" heading for uncategorized events in category-grouped collections
- Updated dependencies [d5634da]
- Updated dependencies [fb617bd]
- Updated dependencies [d9b5b55]
  - @eventuras/ratio-ui@0.14.1
  - @eventuras/event-sdk@3.0.0
  - @eventuras/datatable@0.5.11
  - @eventuras/markdown@8.1.1
  - @eventuras/markdown-plugin-happening@3.0.1
  - @eventuras/ratio-ui-next@0.1.12
  - @eventuras/smartform@0.3.4
  - @eventuras/toast@0.2.11

## 2.34.0

### Minor Changes

- 8db0d59: Featured event collections with category grouping
  - Frontpage shows featured collections at the top with events grouped by category
  - Collection detail page groups events by category with section headings
  - Fix: EventLookup popover crash (missing triggerRef)
  - Fix: InitTheme script warning (next/script → inline script)
  - Fix: CollectionEditor server-only import error (moved to server action)

### Patch Changes

- Updated dependencies [8db0d59]
  - @eventuras/event-sdk@2.31.0

## 2.33.0

### Minor Changes

- 0d4bc2d: ### Event editor
  - Enable callout plugin on program, practical information, and more information fields
  - Enable callout rendering on public event details page via remarkCallout

## 2.32.1

### Patch Changes

- Updated dependencies [ed973fc]
- Updated dependencies [ed973fc]
- Updated dependencies [ed973fc]
  - @eventuras/scribo@0.10.0
  - @eventuras/markdown@8.1.0

## 2.32.0

### Minor Changes

- e981f9d: ### Event editor
  - Enable schedule plugin in the program field for structured schedule editing

### Patch Changes

- Updated dependencies [e981f9d]
  - @eventuras/scribo@0.9.0

## 2.31.0

### Minor Changes

- bbb9111: ### ratio-ui
  - Add `ActionBar` layout component for grouping page-level actions

  ### Web
  - Add "Preview certificate" button that opens certificate HTML preview in a new tab
  - Refactor event editor tabs to use `ActionBar` for save and certificate actions

- 0e1796e: ### Menu
  - Rounded corners, softer dividers, and stable border on dropdown menu
  - Add `Menu.ThemeToggle` compound component with Sun/Moon icons from lucide-react
  - Export `Sun` and `Moon` icons from ratio-ui

  ### Web
  - Add dark/light theme toggle to user menu
  - Use translated strings for logout label (was hardcoded)
  - Add `lightTheme` / `darkTheme` translation keys (nb-NO, en-US)

### Patch Changes

- e6d002d: ### Fix: Event description 300 character limit validation (#690)
  - Validate markdown length (not plain text) in MarkdownInput, since markdown is what gets stored
  - Block form submission via react-hook-form when description exceeds 300 characters
  - Add `[StringLength(300)]` to API EventFormDto for a clear 400 response instead of 500
  - Migrate scribo eslint config to flat config format

- Updated dependencies [bbb9111]
- Updated dependencies [e6d002d]
- Updated dependencies [0e1796e]
  - @eventuras/ratio-ui@0.14.0
  - @eventuras/scribo@0.8.4
  - @eventuras/datatable@0.5.10
  - @eventuras/markdown@8.0.0
  - @eventuras/markdown-plugin-happening@3.0.0
  - @eventuras/ratio-ui-next@0.1.11
  - @eventuras/smartform@0.3.3
  - @eventuras/toast@0.2.10

## 2.30.0

### Minor Changes

- 949d8b6: ### 🧱 Features
  - feat(api,web): implement correlation ID handling across API requests and responses (8055dac) [@eventuras/api]

### Patch Changes

- d752b18: ### 🐞 Bug Fixes
  - fix(web): sync turbo.json env vars with app.config.json (28c8deb) [@eventuras/web]

  ♻️ Refactoring
  - refactor(web): replace Auth0 with generic OIDC auth routes (574acae) [@eventuras/web]

- 2bdf1aa: ### 🧹 Maintenance
  - chore(api): update test project references (14f1ede) [@eventuras/api]
  - chore(api): update package references to latest versions (5d4b656) [@eventuras/api]
  - chore(api): remove unused featured disabled exception (0d9d2fd) [@eventuras/api]
  - chore(api): remove Feature Management package references (83940b0) [@eventuras/api]

- Updated dependencies [d752b18]
- Updated dependencies [949d8b6]
- Updated dependencies [0b4b869]
- Updated dependencies [2bdf1aa]
  - @eventuras/event-sdk@2.30.0
  - @eventuras/ratio-ui@0.13.0
  - @eventuras/fides-auth-next@0.1.4
  - @eventuras/datatable@0.5.9
  - @eventuras/markdown@7.0.0
  - @eventuras/markdown-plugin-happening@2.0.0
  - @eventuras/ratio-ui-next@0.1.10
  - @eventuras/smartform@0.3.2
  - @eventuras/toast@0.2.9

## 2.29.0

### Minor Changes

- 10235ad: ### 🧱 Features
  - feat(web): implement PDF certificate proxy (7375ef3) [@eventuras/web]

  ### 🐞 Bug Fixes
  - fix(web): improve error handling in createEvent function (89e8953) [@eventuras/web]

- 867c9f3: ### 🧱 Features
  - feat(web): enhance EconomySection with status grouping (821fc39) [@eventuras/web]

- 21d0d6f: ### 🧱 Features
  - feat(web): add system version endpoint with build info (e6bb28e7) [@eventuras/web]

### Patch Changes

- Updated dependencies [10235ad]
- Updated dependencies [867c9f3]
- Updated dependencies [fce9a48]
- Updated dependencies [cc205db]
- Updated dependencies [cc205db]
- Updated dependencies [21d0d6f]
- Updated dependencies [21d0d6f]
  - @eventuras/event-sdk@2.29.0
  - @eventuras/ratio-ui@0.12.0
  - @eventuras/markdown@6.0.0
  - @eventuras/datatable@0.5.8
  - @eventuras/markdown-plugin-happening@1.0.0
  - @eventuras/ratio-ui-next@0.1.9
  - @eventuras/smartform@0.3.1
  - @eventuras/toast@0.2.8

## 2.28.0

### Minor Changes

- 1915b0c: ### @eventuras/web
  - Move all environment variables from `NEXT_PUBLIC_*` to server-side only; add `config.server.ts` with `appConfig` helper
  - Add Docker multi-stage build with Next.js standalone output
  - Convert public pages (frontpage, events listing, collections listing, event/collection detail) from ISR to `force-dynamic` — removes build-time `ORGANIZATION_ID` requirement
  - Add `getOrganizationId()` helper in `src/utils/organization.ts` to centralise org ID access
  - Use `appConfig.env` in `login`/`logout` route handlers instead of bare `process.env`
  - Fix Playwright e2e `registerForEvent` to handle already-registered users idempotently

  ### @eventuras/event-sdk
  - Bundle `eventuras-v3.json` OpenAPI spec directly in the package; remove `@eventuras/api` workspace devDependency
  - Add `openapi:update` script to sync the spec from `apps/api/docs/eventuras-v3.json`

### Patch Changes

- Updated dependencies [1915b0c]
  - @eventuras/event-sdk@2.28.0

## 2.27.9

### Patch Changes

- Updated dependencies [c32e23c]
- Updated dependencies [c32e23c]
- Updated dependencies [39bd56b]
- Updated dependencies [c32e23c]
- Updated dependencies [c32e23c]
  - @eventuras/datatable@0.5.7
  - @eventuras/ratio-ui@0.11.0
  - @eventuras/smartform@0.3.0
  - @eventuras/markdown@5.0.0
  - @eventuras/ratio-ui-next@0.1.8
  - @eventuras/toast@0.2.7

## 2.27.8

### Patch Changes

- f2b3605: Layout enhancements
- 4a6097f: Enhanced dark mode support across UI components.
- b44822c: Upgrade dependencies across monorepo

  This update brings the latest stability improvements and bug fixes from upstream dependencies.

- Updated dependencies [4a6097f]
  - @eventuras/ratio-ui@0.10.1
  - @eventuras/scribo@0.8.3
  - @eventuras/datatable@0.5.6
  - @eventuras/markdown@4.0.1
  - @eventuras/ratio-ui-next@0.1.7
  - @eventuras/smartform@0.2.6
  - @eventuras/toast@0.2.6

## 2.27.7

### Patch Changes

- ### 🧱 Features

  **ratio-ui:**
  - Add new `AutoComplete` component with async loading and client-side filtering capabilities
  - Add new `SearchField` component for search inputs
  - Add new `ListBox` component for accessible list selection
  - Add new `TextField` component as complete form field with label, description, and error handling

  **smartform:**
  - Export new `TextField` component for react-hook-form integration
  - Refactor `Input` component to be a lightweight primitive
  - Update `NumberInput` to use `Label` component instead of `InputLabel`

  **web:**
  - Update multiple admin forms to use new AutoComplete component
  - Migrate forms from Input to TextField where appropriate

  ### 🐞 Bug Fixes

  **ratio-ui:**
  - Enhance AutoComplete with improved selected label handling and filtering logic

  ### ♻️ Refactoring

  **ratio-ui:**
  - Replace Input component with TextField for better separation of concerns
  - Rename `InputLabel` to `Label` for consistency

- Updated dependencies
  - @eventuras/ratio-ui@0.10.0
  - @eventuras/smartform@0.2.5
  - @eventuras/datatable@0.5.5
  - @eventuras/markdown@4.0.0
  - @eventuras/ratio-ui-next@0.1.6
  - @eventuras/toast@0.2.5

## 2.27.6

### Patch Changes

- ### 🧱 Features

  **ratio-ui:**
  - Add new `AutoComplete` component with async loading and client-side filtering capabilities
  - Add new `SearchField` component for search inputs
  - Add new `ListBox` component for accessible list selection
  - Add new `TextField` component as complete form field with label, description, and error handling

  **smartform:**
  - Export new `TextField` component for react-hook-form integration
  - Refactor `Input` component to be a lightweight primitive
  - Update `NumberInput` to use `Label` component instead of `InputLabel`

  **web:**
  - Update multiple admin forms to use new AutoComplete component
  - Migrate forms from Input to TextField where appropriate

  ### 🐞 Bug Fixes

  **ratio-ui:**
  - Enhance AutoComplete with improved selected label handling and filtering logic

  ### ♻️ Refactoring

  **ratio-ui:**
  - Replace Input component with TextField for better separation of concerns
  - Rename `InputLabel` to `Label` for consistency

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/ratio-ui@0.9.0
  - @eventuras/smartform@0.2.4
  - @eventuras/logger@0.6.0
  - @eventuras/datatable@0.5.4
  - @eventuras/markdown@3.0.0
  - @eventuras/ratio-ui-next@0.1.5
  - @eventuras/toast@0.2.4
  - @eventuras/fides-auth-next@0.1.3

## 2.27.5

### Patch Changes

- chore: update deps
- Updated dependencies
  - @eventuras/ratio-ui-next@0.1.4
  - @eventuras/core-nextjs@0.1.2
  - @eventuras/app-config@0.1.2
  - @eventuras/event-sdk@2.27.5
  - @eventuras/markdown@2.0.2
  - @eventuras/ratio-ui@0.8.2
  - @eventuras/scribo@0.8.2
  - @eventuras/datatable@0.5.3
  - @eventuras/smartform@0.2.3
  - @eventuras/toast@0.2.3

## 2.27.4

### Patch Changes

- chore: update dependencies across frontend packages
- Updated dependencies
  - @eventuras/fides-auth-next@0.1.2
  - @eventuras/ratio-ui-next@0.1.3
  - @eventuras/core-nextjs@0.1.1
  - @eventuras/app-config@0.1.1
  - @eventuras/datatable@0.5.2
  - @eventuras/markdown@2.0.1
  - @eventuras/ratio-ui@0.8.1
  - @eventuras/scribo@0.8.1
  - @eventuras/smartform@0.2.2
  - @eventuras/toast@0.2.2

## 2.27.3

### Patch Changes

- ### 🧹 Maintenance
  - chore(web): add reverse sorting to pastEvents (16569e5) [@eventuras/web]

## 2.27.1

- Sync release versions across packages api, web, event-sdk

## 0.9.0

### Minor Changes

- ### 🧱 Features
  - feat(web): enhance event product management UI and localization (c145d7e) [@eventuras/web]
  - chore(web): upgrade packages

  ### 🐞 Bug Fixes
  - fix(web): ensure correct type casting for form submission in CollectionCreator (8d2238b) [@eventuras/web]

## 0.8.0

### Minor Changes

- ### 🧱 Features
  - feat(web): add download and send functionality for certificates (7d4c84b) [@eventuras/web]

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.0
  - @eventuras/datatable@0.5.1
  - @eventuras/markdown@2.0.0
  - @eventuras/ratio-ui-next@0.1.2
  - @eventuras/smartform@0.2.1
  - @eventuras/toast@0.2.1

## 0.7.0

### Minor Changes

### 🧱 Features

- feat(web): enable external links in description (5c29023) [@eventuras/web]
- feat(web): add notifications feature with history and details view (70ff927) [@eventuras/web]
- feat(web): add FinishRegistrationButton component for updating registration status (de6fe79) [@eventuras/web]
- feat(web): enhance registration and event components with new features and improved UI (ef22b64) [@eventuras/web]
- feat(web): add FreeRegistration property to Registration model and update related DTOs (e245a26) [@eventuras/web]
- feat(web): add Economy tab and reusable Table component (6e4c450) [@eventuras/web]
- feat(web): enhance AdminPage layout with ButtonGroup and improved spacing (c4a964e) [@eventuras/web]
- feat(web): enhance Markdown support in event editor and public pages (19322bc) [@eventuras/web]
- feat(web-e2e): integrate gmail client (914e18c) [@eventuras/web]
- feat(web): new event admin gui (1bbb1c1) [@eventuras/web]
- feat(web): add expandable rows and user details in participant list (0a4f8d4) [@eventuras/web]
- feat(web): enhance event management interface (9379b4b) [@eventuras/web]
- feat(web): integrate event editor into main page (e8bb5ac) [@eventuras/web]
- feat(web): auto save events on admin (c7aa0a4) [@eventuras/web]
- feat(web): return to last page after re login (0066988) [@eventuras/web]
- feat(web): require event-sdk client wrapper (06a03db) [@eventuras/web]
- feat(web): patch registrations (24edf15) [@eventuras/web]
- feat(web): use reworked auth library (8d55c61) [@eventuras/web]
- feat(web): add and integrate public client (8653ed3) [@eventuras/web]
- feat(web): reworked eventflow with stepper (a2e5fd5) [@eventuras/web]
- feat(web,ratio-ui): implement error handling components and overlays for better user feedback (b18c222) [@eventuras/web]
- feat(web): better error handling on event detail page (caaf499) [@eventuras/web]
- feat(web,event-sdk): await sdk-config (945510c) [@eventuras/web]

### 🐞 Bug Fixes

- fix(web): fix participant status filters and preserve user data (256e107) [@eventuras/web]
- fix(web): fix Excel export functionality for event registrations (cee9c94) [@eventuras/web]
- fix(web): add searchParams handling and pagination to AdminPage (9818d2b) [@eventuras/web]
- fix(web): correct destructuring of searchParams in AdminPage component (ae5fd28) [@eventuras/web]
- fix(web): improve organization ID validation and provide default value (663a4bc) [@eventuras/web]
- fix(web): validate organization ID at runtime and improve error handling (ab10b27) [@eventuras/web]
- fix(web): event management components (4dc66b9) [@eventuras/web]
- fix(web): fix order actions (ae64c64) [@eventuras/web]
- fix(web): save markdown fields again (2ec9242) [@eventuras/web]
- fix(web): use process.env during build (097721d) [@eventuras/web]
- fix(web): import scribo css (ac63dfc) [@eventuras/web]
- fix(web): change import to type for OAuthConfig in oauthConfig.ts (3f83242) [@eventuras/web]
- fix(web): configure client (61772ae) [@eventuras/web]
- fix(web): ensure organization ID is always defined in createSDK (2fa02cd) [@eventuras/web]
- fix(web): update app configuration (18534a9) [@eventuras/web]
- fix(web): add build step for dependencies in CI workflow (ea4246e) [@eventuras/web]
- fix(web): ensure deps are built before web (abf127b) [@eventuras/web]
- fix(web): ensure deps are built correctly (bb610e2) [@eventuras/web]

### ♻️ Refactoring

- refactor(web): prepare removal of messagelog (7a6a4d2) [@eventuras/web]
- refactor(web): add admin role check to layout page (61c1cc8) [@eventuras/web]
- refactor(web): improve lazy configuration of api client (d3fbd5d) [@eventuras/web]
- refactor(web): update UserLookup component (089e08c) [@eventuras/web]
- refactor(web): refactor notificatior logic (d568eb9) [@eventuras/web]
- refactor(web): refactor eventparticipantlist (7ba1d6f) [@eventuras/web]
- refactor(web): use nextjs page groups (a467a9c) [@eventuras/web]
- refactor(web): use more event-sdk (bc9954c) [@eventuras/web]
- refactor(web): use debug for api forwarder (74a06dc) [@eventuras/web]
- refactor(web-e2e): change from logger to debug (f11eae9) [@eventuras/web]
- refactor(web): use new logger (0f41301) [@eventuras/web]
- refactor(web-e2e): change logger imports (711774e) [@eventuras/web]
- refactor(web,ratio-ui): streamline imports and enhance type definitions across components (9a64a93) [@eventuras/web]

### 🧹 Maintenance

- chore(web,historia): upgrade next js to v16 (0d5a7a8) [@eventuras/web]
- chore(web-e2e): some minor fixes (265e53e) [@eventuras/web]
- chore(web): upgrade all packages (4fdc2ad) [@eventuras/web]
- chore(web): remove NEXT_PUBLIC_API_VERSION (491e6e5) [@eventuras/web]
- chore(web): update sdk (b3f9b70) [@eventuras/web]
- chore(web): enhance user search functionality with logging and error handling (ffb876d) [@eventuras/web]
- chore(web): enhance event handling and user experience with improved error messages and UI updates (61e59f6) [@eventuras/web]
- chore(web): selfconfiguring api client (ef73645) [@eventuras/web]
- chore(web): remove old sdk (92f7499) [@eventuras/web]
- chore(web): enforce dynamic rendering for admin and user routes (8f46c3c) [@eventuras/web]
- chore(web): used named imports from ratio-uo (a9d2d4d) [@eventuras/web]
- chore(web): remove Wrapper component and replace with direct layout usage (473e5ca) [@eventuras/web]
- chore(web): update to use new sdk (7655631) [@eventuras/web]
- chore(web): just cleaning (b3ca142) [@eventuras/web]
- chore(web): using new event-sdk (f224f0b) [@eventuras/web]
- chore(web): use new sdk (97a8c9e) [@eventuras/web]
- chore(web): use orgid typed (e7f81d1) [@eventuras/web]
- chore(web): use app-config (2dd6f2e) [@eventuras/web]
- chore(web): remove pino-pretty support (40ff813) [@eventuras/web]
- chore(web): enhance logging (068b40d) [@eventuras/web]
- chore(web): clean up deps linking (95da0d8) [@eventuras/web]
- chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (b2de638) [@eventuras/web]

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/event-sdk@0.6.0
  - @eventuras/logger@0.5.0
  - @eventuras/smartform@0.2.0
  - @eventuras/scribo@0.8.0
  - @eventuras/datatable@0.5.0
  - @eventuras/toast@0.2.0
  - @eventuras/markdown@1.0.0
  - @eventuras/ratio-ui@0.7.0
  - @eventuras/fides-auth-next@0.1.1
  - @eventuras/app-config@0.1.0
  - @eventuras/core@0.1.0
  - @eventuras/core-nextjs@0.1.0
  - @eventuras/ratio-ui-next@0.1.1

## 0.6.1

### Patch Changes

- - chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (51e931b) [@eventuras/web]
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/markdown@5.0.1
  - @eventuras/scribo@0.7.1
  - @eventuras/sdk@0.13.1

## 0.6.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - chore(web): remove Storybook and unused assets (4f8dec0)
  - fix(web): reads locale from env again (9089f8b)
  - chore(web): npm packages (5fd97b0)
  - fix(web): fixes error in productmodal (20dcd3f)
  - feat(web): xstate machine for notifications (3ecfaf1)
  - chore(web): upgrade to react 19 and next 15 (9b6aa22)
  - feat(web): add button to email certificate (20b2b2b)
  - fix(web): add rollup dependencies (c0a9264)
  - chore(web): chore upgrades (abfa40b)
  - test(web): update tab id (23700e1)
  - feat(web): add ui for download participant list in excel (a3d3115)
  - feat(web): add collection-editor (d890b34)
  - feat(web): view event collections (43d92e3)
  - chore(web): upgrade npm packages (7b1bec7)
