---
'@eventuras/web': patch
---

Isolate each tab in the admin event editor behind an `ErrorBoundary` so a deep crash inside one tab no longer takes down the whole admin page. Logs to Sentry with `section: admin` and `tab: <id>` tags.
