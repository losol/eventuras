---
'@eventuras/ratio-ui': minor
---

Add `<ActionButton>` at `@eventuras/ratio-ui/core/ActionButton` — a compact chrome button for toolbars, close affordances, table-row actions, and other dense surfaces. Sibling to `Button` for cases where a labelled `Button` would be too loud. Composes via `children` so the same component covers icon-only, icon + text, and text-only buttons; `ariaLabel` is the screen-reader name for icon-only usage. Variants `subtle` and `solid` on top of a transparent bordered default. Colors and radius come from CSS tokens (`--action-button-bg/-fg/-border/-radius`, hover variants) so themed containers can re-skin locally without forking. Tokens live in `tokens/action-button.css`.
