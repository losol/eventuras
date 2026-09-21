---
'@eventuras/web': minor
---

The admin tables run on `@eventuras/datatable` 0.8, which moved to TanStack Table v9 and ships it as its own dependency, so the web app no longer depends on TanStack at all. Columns are typed with the datatable's `DataTableColumnDef`, so columns built for another row type than the table's data are a type error.

The tables look different: they render through Ratio UI's `Table`, so rows are separated by the theme's hairlines rather than zebra striping, and header and cell tones follow the theme in light and dark.

`enableSorting: true` is gone from two columns. It never did anything — the datatable has never registered sorting, in 0.6 or now — but TanStack v8 accepted the option silently, where v9's types reject it. No table sorted before this change, and none does after.
