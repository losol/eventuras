---
"@eventuras/docs-framework": minor
---

Consolidate search into `@eventuras/docs-framework`. The retired
`@eventuras/lustro-search` package is folded in under new `./search`,
`./build-index` and `./react` subpath exports, and the package now builds with
Vite. Adds a library-first `runCollect()` helper (replacing the removed oclif
CLI) and drops the unused `./collect` and `./config` exports.
