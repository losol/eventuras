---
'@eventuras/web': patch
---

Skip Sentry client-side initialisation when `navigator.userAgent` matches a known crawler (detected via the new `isBot` helper from `@eventuras/core/useragents`). Crawlers produce ChunkLoadError and hydration noise that's not actionable; suppressing the SDK at init time keeps those events out of the error tracker without affecting real users.
