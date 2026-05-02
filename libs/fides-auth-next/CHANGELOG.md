# @eventuras/fides-auth-next

## 0.1.11

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

- Updated dependencies [22c3761]
- Updated dependencies [a29b507]
  - @eventuras/fides-auth@0.7.0
  - @eventuras/logger@0.8.1

## 0.1.10

### Patch Changes

- Updated dependencies [7caaea2]
  - @eventuras/fides-auth@0.6.0

## 0.1.9

### Patch Changes

- Updated dependencies [0783155]
  - @eventuras/fides-auth@0.5.0

## 0.1.8

### Patch Changes

- Updated dependencies [ea5bb15]
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/fides-auth@0.4.0
  - @eventuras/logger@0.8.0

## 0.1.7

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/fides-auth@0.3.1
  - @eventuras/logger@0.7.1

## 0.1.6

### Patch Changes

- 4b30339: Move @eventuras/typescript-config from dependencies to devDependencies

## 0.1.5

### Patch Changes

- Updated dependencies [6e7d2d4]
  - @eventuras/logger@0.7.0

## 0.1.4

### Patch Changes

- Updated dependencies [d752b18]
  - @eventuras/fides-auth@0.3.0

## 0.1.3

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.6.0
  - @eventuras/fides-auth@0.2.1

## 0.1.2

### Patch Changes

- chore: update dependencies across frontend packages

## 0.1.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @eventuras/logger@0.5.0
  - @eventuras/fides-auth@0.2.0
