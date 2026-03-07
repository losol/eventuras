# @eventuras/event-sdk

## 2.28.0

### Patch Changes

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

## 2.27.5

### Patch Changes

- chore: update deps

## 2.27.1

- Sync release versions across packages api, web, event-sdk

## 0.6.1

### Patch Changes

- 7cbfcd4: - 🧹 chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (b2de638) [@eventuras/event-sdk]

## 0.6.0

### Minor Changes

### 🧱 Features

- feat(web,event-sdk): await sdk-config (945510c) [@eventuras/event-sdk]

### 🧹 Maintenance

- chore(event-sdk): update with registration patch (0d3904e) [@eventuras/event-sdk]
- chore(event-sdk): rename client to client-next (9267bf7) [@eventuras/event-sdk]
- chore(event-sdk): minor comments formatting (8968091) [@eventuras/event-sdk]

### Patch Changes

### 🧹 Maintenance

- chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (b2de638) [@eventuras/event-sdk]

## 0.5.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - fix(event-sdk): fixes sdk build againg (3fc5e7a)
  - chore(event-sdk): upgrade event-sdk (880a891)
  - chore(event-sdk): upgrade version (f67025f)
  - chore(event-sdk): upgrade hey api client (d6824b9)
