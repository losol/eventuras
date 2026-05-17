---
'@eventuras/web': patch
---

Fix Sentry init timing in `InitSentry`. In the App Router, `<Script strategy="beforeInteractive">` is queued into Next's `__next_s` runtime instead of emitted as an inline `<script>`, so it executes *after* the client bundle. `instrumentation-client.ts` reads `window.__SENTRY_CONFIG__` at module top-level and saw `undefined`, so `Sentry.init` never ran. Render the config as a plain `<script dangerouslySetInnerHTML>` so it executes synchronously at parse time, before any module.
