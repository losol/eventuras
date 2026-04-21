# @eventuras/event-sdk

## 3.1.1

### Patch Changes

- Updated dependencies [d27ed81]
  - @eventuras/api@3.4.0

## 3.1.0

### Minor Changes

- e5b6622: feat: `GET /v3/business-events` endpoint

  New admin-only endpoint and corresponding SDK client for listing
  business events (audit log) for a given subject within the current
  organization.
  - `getV3BusinessEvents(...)` — fetches paged `BusinessEventDto[]`.
  - Query: `?subjectType=order|registration|user&subjectUuid={guid}&page=1&count=50`.
  - Gated server-side by role **and** membership: org admins can only
    read their own organisation's events, system admins can read any.
    The new `IBusinessEventAccessControlService` is invoked from inside
    `BusinessEventService.ListEventsAsync`, so every future caller of
    the service inherits the same enforcement.
  - Org resolved from `Eventuras-Org-Id` / `?orgId` / hostname; a caller
    cannot silently read another tenant by flipping the header because
    the membership check fails.

- f9b1373: feat(web): show business-events Timeline on admin registration/order pages

  Admins browsing `/admin/registrations/{id}` or `/admin/orders/{id}`
  now see an "Activity" section at the bottom with a vertical timeline
  of the resource's BusinessEvents — status changes, cancellations,
  invoicing, etc. — fetched server-side via
  `GET /v3/business-events?subjectType=&subjectUuid=`. The new
  `<BusinessEventsTimeline>` server component maps each
  `BusinessEventDto` onto a `<Timeline.Item>` from
  `@eventuras/ratio-ui/core/Timeline`, with:
  - formatted `createdAt` timestamp
  - the event's human-readable `message` as the title
  - dot colour derived from the event type suffix (`.created` →
    success, `.cancelled`/`.refunded` → warning, `.invoiced` → info)
  - optional actor (short Uuid for now; name resolution is a follow-up)
  - metadata rendered as a collapsed JSON block when present

  Also exposes `Uuid` on `OrderDto` so the SDK has the subject key
  available without an extra lookup; `RegistrationDto.uuid` already
  existed. Access is enforced server-side by the endpoint's admin
  policy and org-membership check — the component itself does not
  re-validate.

### Patch Changes

- Updated dependencies [e5b6622]
- Updated dependencies [f9b1373]
  - @eventuras/api@3.3.0

## 3.0.4

### Patch Changes

- Updated dependencies [86449d7]
  - @eventuras/api@3.2.0

## 3.0.3

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [cf4ffa4]
  - @eventuras/api@3.1.2

## 3.0.2

### Patch Changes

- Updated dependencies [bbcc5c6]
  - @eventuras/api@3.1.1

## 3.0.1

### Patch Changes

- Updated dependencies [e61d631]
  - @eventuras/api@3.1.0

## 3.0.0

### Major Changes

- d9b5b55: Regenerate SDK from v3 API OpenAPI specification.
  - `SuperAdmin` role removed from API — only `Admin` and `SystemAdmin` remain
  - Deprecated fields removed from response types: `Registration.log`, `Order.log`, `Order.externalInvoiceId`, `Order.paid`
  - `EventFormDto.manageRegistrations` and `EventFormDto.externalRegistrationsUrl` still present but ignored by API
  - `Certificate.certificateGuid` field preserved (renamed from `CertificateGuid` internally)
  - New `uuid` field added to most entity response types

### Patch Changes

- fb617bd: Resolve the OpenAPI spec via the `@eventuras/api/openapi` package export instead of a relative path. This restores the Docker build, which uses `turbo prune --docker` and was excluding `apps/api/docs/eventuras-v3.json` because it lived outside the SDK's dependency graph.
- Updated dependencies [558cab2]
- Updated dependencies [4dfcb2f]
  - @eventuras/api@3.0.0

## 2.31.0

### Minor Changes

- 8db0d59: Add Featured and IncludePastCollections filters to event collections API
  - Featured filter to query only featured collections
  - IncludePastCollections filter (default false) to hide collections where all events have passed
  - Computed dateStart/dateEnd on EventCollectionDto based on contained events

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

## 2.29.0

### Minor Changes

- 10235ad: ### 🧱 Features
  - feat(web): implement PDF certificate proxy (7375ef3) [@eventuras/web]

  ### 🐞 Bug Fixes
  - fix(web): improve error handling in createEvent function (89e8953) [@eventuras/web]

- 867c9f3: ### 🧱 Features
  - feat(web): enhance EconomySection with status grouping (821fc39) [@eventuras/web]

### Patch Changes

- 21d0d6f: ### 🐞 Bug Fixes
  - fix(event-sdk): refine type definitions and improve body serialization (d9ce91a) [@eventuras/event-sdk]

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
