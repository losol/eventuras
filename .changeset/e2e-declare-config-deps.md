---
'@eventuras/e2e': patch
---

Declare `@eventuras/typescript-config` and `@eventuras/eslint-config` as devDependencies — the configs extended them while the workspace copies existed, and the implicit resolution broke when the packages moved to npm (origo)
