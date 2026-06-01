---
'@eventuras/core': patch
---

Default `formatDate`/`formatDateSpan`/`formatCompactDateRange` to `Europe/Oslo` time zone so SSR (server clock, typically UTC) and client hydration (user device) produce identical date strings. Fixes React hydration error #418 on event pages for users whose device time zone differs from the server's. Override via the new `timeZone` option (or `timeZone` argument on `formatCompactDateRange`) when a different zone is needed.
