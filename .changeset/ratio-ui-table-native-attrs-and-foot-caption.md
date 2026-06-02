---
'@eventuras/ratio-ui': minor
---

`Table` and its subcomponents now extend their native HTML attribute types — `Table`, `Table.Header`, `Table.Body`, `Table.Foot`, `Table.Row`, `Table.HeadCell`, `Table.Cell`, `Table.Caption` all forward the rest of their props (`colSpan`/`rowSpan`, `scope`, `onClick`, `aria-*`, `data-*`, …) to the underlying element. Adds two new subcomponents: `Table.Foot` (`<tfoot>`) and `Table.Caption` (`<caption>`).
