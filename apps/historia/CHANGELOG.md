# @eventuras/historia

## 0.16.1

### Patch Changes

- ### 🐞 Bug Fixes
  - fix(historia): add the missing migrations (bec19fe) [@eventuras/historia]

## 0.16.0

### Minor Changes

- ### 🧱 Features
  - feat(historia): add contact points with user relationships (638c432) [@eventuras/historia]
  - feat(historia): add ObfuscatedEmail in footer for email protection (b109673) [@eventuras/historia]
  - feat(historia): enhance locale handling in RootLayout component (359a936) [@eventuras/historia]
  - feat(historia): add skip to main content link for improved accessibility (a7455c3) [@eventuras/historia]
  - feat(historia): implement dynamic metadata generation for pages (e093e95) [@eventuras/historia]
  - feat(historia): upgrades footer with better styled links (e77d214) [@eventuras/historia]

## 0.15.0

### Minor Changes

- ### 🧱 Features
  - feat(historia): enhance layout with Container and Grid components for improved structure (494dbe9) [@eventuras/historia]
  - feat(historia): adds mcp server and import/export (a1a2bae) [@eventuras/historia]

## 0.14.2

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.0
  - @eventuras/ratio-ui-next@0.1.2
  - @eventuras/toast@0.2.1

## 0.14.1

### Patch Changes

- ### 🧹 Maintenance
  - chore(historia, eslint-config): deps (6239f22) [@eventuras/historia]

## 0.14.0

### Minor Changes

- 4f5eac8: ### 🧱 Features
  - feat(historia): implement order status update based on transaction status (00fa8ed) [@eventuras/historia]

  ### 🧹 Maintenance
  - chore(historia): add indexes and migrations (0d9de2e) [@eventuras/historia]

  ### ⚙️ CI/CD
  - ci(historia): enhance CI/CD workflow (87c2014) [@eventuras/historia]
  - ci(historia): implement health check endpoint for service status (5799169) [@eventuras/historia]

### Patch Changes

- ### 🐞 Bug Fixes
  - fix(historia): create ISR cache directory with correct permissions (9a925ec) [@eventuras/historia]
  - fix(historia): update Dockerfile to install sharp dependencies (b4bb94f) [@eventuras/historia]
  - fix(historia): ensure .next/server directory exists and is writable (cf88fed) [@eventuras/historia]

  ### ⚙️ CI/CD
  - ci(historia): remove obsolete CI workflow (3eccc8b) [@eventuras/historia]

## 0.13.0

### Minor Changes

- ### 🧱 Features
  - feat(historia): enhance page routing with breadcrumbs URL support (bbef557) [@eventuras/historia]
  - feat(historia): add Image block with media and caption support (915ced8) [@eventuras/historia]

## 0.12.0

### Minor Changes

- ### 🧱 Features
  - feat(historia): add payment cancellation and refund functionality (fc2b293) [@eventuras/historia]
  - feat(historia): implement order shipment (a2cf745) [@eventuras/historia]
  - feat(historia): enhance shipping details and address (bd84c9f) [@eventuras/historia]

## 0.11.0

### Minor Changes

- ### 🧱 Features
  - feat(historia): share persons, organisations and places across tenants (39ec11e) [@eventuras/historia]
  - feat(historia): add shipments collection (b96ca90) [@eventuras/historia]

## 0.10.0

### Minor Changes

### 🧱 Features

- feat(historia): add BusinessEvents collection (f414a2e) [@eventuras/historia]
- feat(historia): refactor pricing structure to handle VAT calculations (7947a93) [@eventuras/historia]
- feat(historia): add footer component (e1a3b37) [@eventuras/historia]
- feat(historia): add Nav block and enhance Organizations and Websites collections (d29b7c7) [@eventuras/historia]
- feat(historia): add ProductsBlock (d7539ce) [@eventuras/historia]
- feat(historia): add database migration step in Dockerfile build process (d572a21) [@eventuras/historia]
- feat(historia): add support for BuildKit secrets in Dockerfile (0619aa9) [@eventuras/historia]
- feat(historia): migrate to ePayment API (1775ed7) [@eventuras/historia]
- feat(historia): enhance Vipps payment integration (0687d9f) [@eventuras/historia]
- feat(historia): enhance product detail (ee04795) [@eventuras/historia]
- feat(historia): implement cart functionality in navbar (40fb8d6) [@eventuras/historia]
- feat(historia): implement Vipps Express payment flow and callback handling (a7ca655) [@eventuras/historia]
- feat(historia): add Vipps Express Checkout button (7c836df) [@eventuras/historia]
- feat(historia): implement cart functionality with localStorage (8324365) [@eventuras/historia]
- feat(historia): add transactions collection (442a3df) [@eventuras/historia]
- feat(historia): add orders collection with access control and hooks for price population (883d97e) [@eventuras/historia]
- feat(historia): add product collection (131f10c) [@eventuras/historia]
- feat(historia): update collection translations and URL formatting for slug and resourceId (6f891d8) [@eventuras/historia]

### ♻️ Refactoring

- refactor(historia): use common url field (550daab) [@eventuras/historia]
- refactor(historia): update user references (ce71d95) [@eventuras/historia]
- refactor(historia,vipps): add Vipps integration library with ePayment API and core utilities (53dfff5) [@eventuras/historia]
- refactor(historia): payment processing and integrate Vipps API (91d530d) [@eventuras/historia]
- refactor(historia): refactor Vipps checkout integration and enhance error handling (aa7f285) [@eventuras/historia]

### 🧹 Maintenance

- chore(historia): implement shipping options (60c2041) [@eventuras/historia]
- chore(historia): use standard button for paying (3ef995e) [@eventuras/historia]
- chore(historia,app-config): update app-config (2642b6b) [@eventuras/historia]
- chore(historia): update Dockerfile and payload config (e4b091b) [@eventuras/historia]
- chore(historia): do not require user relationship on orders (5b4e8a5) [@eventuras/historia]
- chore(historia): clean up code structure and remove unused code snippets (fee8a1a) [@eventuras/historia]
- chore(historia): add Node.js >=20.9.0 engine requirement (6a939c6) [@eventuras/historia]
- chore(web,historia): upgrade next js to v16 (0d5a7a8) [@eventuras/historia]

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/logger@0.5.0
  - @eventuras/fides-auth@0.2.0
  - @eventuras/toast@0.2.0
  - @eventuras/ratio-ui@0.7.0
  - @eventuras/fides-auth-next@0.1.1
  - @eventuras/vipps@0.1.1
  - @eventuras/app-config@0.1.0
  - @eventuras/core@0.1.0
  - @eventuras/core-nextjs@0.1.0
  - @eventuras/ratio-ui-next@0.1.1

## 0.9.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - feat(historia): add multitenancy (6aa9683)
  - refactor(historia): use 3100 as default port (802e096)
  - fix(historia): update dockerfile.historia (#929) (5cda838)
  - fix(historia): update dockerfile.historia (624b9e6)
  - fix(historia): refactors homepage logic (e6fb3e4)
  - fix(historia): use localized urls in cards (247a982)
  - feat(historia): homepage based on domain (a7c8b5d)
  - feat(historia): adjjust collection slugs (c097dd0)
  - feat(historia): adds ArchiveBlock and refactors story field (0c5dc66)
  - feat(historia): websites collection (d5bff16)
  - feat(historia): localized collection slugs (c6f0f00)
  - feat(historia): scale images when needed (21ac700)
  - refactor(historia): metadata refactoring (c8d07e1)
  - feat(historia): localized collection urls (d7c8038)
  - feat(historia): docker support (667d68c)
  - feat(historia): initial database migrations (41bfd15)
  - fix(historia): remove middleware logging (3fc5602)
  - refactor(historia): page components and improves data handling (7f3ca5d)
  - feat(historia): slug and resourceId for person collection (3a10b80)
  - feat(historia): use resourceId on more collections (2590f00)
  - fix(historia): use collectionarchive correct (a037864)
  - feat(historia): better scandinavian letter slugs (d7adfae)
  - feat(historia): notes pages (2ad35c6)
  - fix(historia): fixes localized home page (b2879e1)
  - refactor(historia): updates field configurations (b19f965)
  - feat(historia): image caption field to support rich text (04630ae)
  - feat(historia): more localization support (0e8569a)
  - feat(historia): simplify logo (77419f2)
  - chore(historia): upgrade to payload 3.15.1 (a182e37)
  - feat(historia): add localisation (b74005c)
  - feat(historia): ui adjustments (9b98989)
  - ci(historia): use npm (363cf47)
  - refactor(historia): removes unused block components (1681c43)
  - refactor(historia): refactors collections and fields for consistency (565a4e8)
  - fix(historia): remove padding for some components (efa6d4d)
  - fix(historia): page refresh (5fcc9c0)
  - ci(historia): remove engines (e9547e3)
  - ci(historia): allow node 22 (120283a)
  - ci(historia): specify engines (ebe8662)
  - fix(historia): update person role component (dd5a994)
  - chore(historia): upgrade payload cms to 3.14 (970ed19)
  - fix(historia): clean up fields (925741c)
  - feat(historia): projects collection (87149ce)
  - chore(historia): payload v3.12 (d711755)
  - feat(historia): adding nested pages (4494765)
  - feat(historia): update articles frontend (7c69cfa)
  - feat(historia): adds richtext field (bda10ea)
  - refactor(historia): change s3 provider (20c8d83)
  - feat(historia): geopoint field (eef5c2d)
  - refactor(historia): renamed image field (0ae659e)
  - fix(historia): update storage plugin (623dc17)
  - refactor(historia): move plugins to separate file (9010979)
  - chore(historia): npm updates (4271ccf)
  - feat(historia): happening program (23cddbc)
  - chore(historia): update payload types (6ba37e9)
  - feat(historia): add config and keyvalues fields (4eb6f62)
  - fix(historia): do not require featured image (15c88b1)
  - feat(historia): remove required story (d2cdac3)
  - ci(historia): require server url (93eb994)
  - feat(historia): add cors policy (c6836f9)
  - refactor(historia): featured image (0eacfb2)
  - ci(historia): add lint/build/deploy actions (7fca38a)
  - feat(historia): adds pages (d4b39ef)
  - feat(historia): adds nested docs and redirects (05c292a)
  - feat(historia): adds s3 media support (1766a93)
  - feat(historia): remove parents (dafa8f6)
  - feat(historia): add articles model (e3ff3db)
  - feat(historia): add access control to collections (d9e0934)
  - feat(historia): add notes model (a4ac1a6)
  - feat(historia): switch to lexical editor (17ad755)
  - fix(historia): null check user in admin check (5ad2214)
  - feat(historia): add media, persons and org (bf1c1ea)
  - feat(historia): license information model (fbcf34a)
  - feat(historia): add roles to users model (11e919c)
  - feat(cms): add happenings collection (2dd1f73)
  - feat(cms): adds places collection (62a3404)
  - feat(cms): initialize payload (b9b66db)
