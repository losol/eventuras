# @eventuras/web

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
