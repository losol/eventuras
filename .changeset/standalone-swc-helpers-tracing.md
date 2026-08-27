---
'@eventuras/web': patch
---

Fix the standalone server crashing on startup with `Cannot find module '@swc/helpers/esm/_interop_require_default.js'`. Since next 16.3.1 (which pins `@swc/helpers` 0.5.23), Node >= 22.10 resolves the helper through the new `module-sync` export condition to the esm files, while Next's output file tracing follows the `require` condition and ships only the cjs files. Force the whole package into the trace via `outputFileTracingIncludes` until vercel/next.js#90567 is fixed upstream.
