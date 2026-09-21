---
'@eventuras/web': minor
---

The admin tables run on `@eventuras/datatable` 0.7, which moved to TanStack Table v9. The datatable only peer-depends on TanStack and leaves providing it to the consumer, so the web app now depends on `@tanstack/react-table`, `@tanstack/table-core` and `@tanstack/match-sorter-utils` at v9 directly — without them it resolved v8 and the build failed on `columnFilteringFeature doesn't exist`.

The tables look different: they render through Ratio UI's `Table`, so rows are separated by the theme's hairlines rather than zebra striping, and header and cell tones follow the theme in light and dark.

`enableSorting: true` is gone from two columns. It never did anything — the datatable has never registered sorting, in 0.6 or now — but TanStack v8 accepted the option silently, where v9's types reject it. No table sorted before this change, and none does after.
