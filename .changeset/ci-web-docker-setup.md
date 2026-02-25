---
"@eventuras/web": minor
"@eventuras/event-sdk": patch
---

### @eventuras/web

- Move all environment variables from `NEXT_PUBLIC_*` to server-side only; add `config.server.ts` with `appConfig` helper
- Add Docker multi-stage build with Next.js standalone output
- Convert public pages (frontpage, events listing, collections listing, event/collection detail) from ISR to `force-dynamic` — removes build-time `ORGANIZATION_ID` requirement
- Add `getOrganizationId()` helper in `src/utils/organization.ts` to centralise org ID access
- Use `appConfig.env` in `login`/`logout` route handlers instead of bare `process.env`
- Fix Playwright e2e `registerForEvent` to handle already-registered users idempotently

### @eventuras/event-sdk

- Bundle `eventuras-v3.json` OpenAPI spec directly in the package; remove `@eventuras/api` workspace devDependency
- Add `openapi:update` script to sync the spec from `apps/api/docs/eventuras-v3.json`
