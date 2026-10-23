---
'@eventuras/web': patch
---

Upgrade `@sentry/nextjs` to 11. `withSentryConfig` now comes from `@sentry/nextjs/config`, `enableLogs` is gone (logs are always on), and `sendDefaultPii` is replaced by `dataCollection`. `SENTRY_SEND_DEFAULT_PII` still switches user info, cookies, headers and query params, and request bodies and local variables are never sent, so events carry what they did with Sentry 10.
