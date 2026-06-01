---
'@eventuras/core': minor
---

Add `@eventuras/core/useragents` subpath export with an `isBot(userAgent)` helper. Patterns are vendored from [omrilotan/isbot](https://github.com/omrilotan/isbot) (public domain / Unlicense), compiled once at module load into a single regex, and work in browser, edge, and server runtimes without an extra npm dependency. Refresh `libs/core/src/useragents/patterns.json` from upstream when new crawlers start polluting events.
