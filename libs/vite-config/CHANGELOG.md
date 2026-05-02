# @eventuras/vite-config

## 0.2.2

### Patch Changes

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

## 0.2.1

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.2.0

### Minor Changes

### 🧱 Features

- feat(vite-config): centralize Vite configurations (6fe962c) [@eventuras/vite-config]

### 🧹 Maintenance

- chore(vite-config): update Vite configuration for Next.js compatibility (b2fa328) [@eventuras/vite-config]

## 0.1.0 (2025-10-18)

### Major Changes

- Initial release of centralized Vite configuration presets
- Added `defineVanillaLibConfig` for vanilla TypeScript libraries
- Added `defineReactLibConfig` for React component libraries
- Added `defineNextLibConfig` for Next.js-compatible libraries

### 🧱 Features

- TypeScript declaration generation with vite-plugin-dts
- Optional Tailwind CSS support
- 'use client' directive preservation for React Server Components
- Configurable module preservation
- Support for multiple entry points via glob patterns
- Automatic exclusion of test files and stories from type generation
- Choice between Babel and SWC for React transformation
