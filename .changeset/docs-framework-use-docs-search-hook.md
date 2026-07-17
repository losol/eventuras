---
"@eventuras/docs-framework": minor
---

Add a headless `useDocsSearch` hook, exported from `./react`. It holds the
debounced search logic that was previously embedded in the `<Search>` component
— which is now a thin ratio-ui wrapper over the hook — making it possible to
render docs search with a different design system by reusing the hook and
providing your own UI.

The extracted logic is also hardened: in-flight requests are invalidated when
the query is cleared and on unmount, and `provider.search` rejections are
handled, so a late or failed response can't overwrite the current results.
