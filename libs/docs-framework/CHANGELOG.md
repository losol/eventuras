# @eventuras/docs-framework

## 0.2.0

### Minor Changes

- ddb57d5: Consolidate search into `@eventuras/docs-framework`. The retired
  `@eventuras/lustro-search` package is folded in under new `./search`,
  `./build-index` and `./react` subpath exports, and the package now builds with
  Vite. Adds a library-first `runCollect()` helper (replacing the removed oclif
  CLI) and drops the unused `./collect` and `./config` exports.
- 696c5f3: Add a headless `useDocsSearch` hook, exported from `./react`. It holds the
  debounced search logic that was previously embedded in the `<Search>` component
  — which is now a thin ratio-ui wrapper over the hook — making it possible to
  render docs search with a different design system by reusing the hook and
  providing your own UI.

  The extracted logic is also hardened: in-flight requests are invalidated when
  the query is cleared and on unmount, and `provider.search` rejections are
  handled, so a late or failed response can't overwrite the current results.

## 0.1.9

### Patch Changes

- @eventuras/lustro-search@4.0.4

## 0.1.8

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/lustro-search@4.0.3

## 0.1.7

### Patch Changes

- @eventuras/lustro-search@4.0.2

## 0.1.6

### Patch Changes

- @eventuras/lustro-search@4.0.1

## 0.1.5

### Patch Changes

- @eventuras/lustro-search@4.0.0

## 0.1.4

### Patch Changes

- @eventuras/lustro-search@3.0.1

## 0.1.3

### Patch Changes

- @eventuras/lustro-search@3.0.0

## 0.1.2

### Patch Changes

- @eventuras/lustro-search@2.0.0

## 0.1.1

### Patch Changes

- @eventuras/lustro-search@1.0.0
