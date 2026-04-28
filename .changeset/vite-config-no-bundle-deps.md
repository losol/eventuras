---
"@eventuras/vite-config": patch
"@eventuras/fides-auth": patch
"@eventuras/fides-auth-next": patch
"@eventuras/ratio-ui": patch
"@eventuras/ratio-ui-next": patch
"@eventuras/smartform": patch
"@eventuras/datatable": patch
"@eventuras/markdown": patch
"@eventuras/markdown-plugin-happening": patch
"@eventuras/scribo": patch
"@eventuras/mailer": patch
"@eventuras/notitia-templates": patch
"@eventuras/logger": patch
"@eventuras/app-config": patch
---

Stop bundling runtime dependencies into published library output, and stop minifying.

The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:

- **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
- **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

The presets now:

- Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
- Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
- Emit sourcemaps so consumer stack traces map back to original sources.

No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.
