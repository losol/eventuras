---
'@eventuras/ratio-ui': minor
---

Add `<Chip>` at `@eventuras/ratio-ui/core/Chip` — a theme-scope-aware tag primitive that reads colors and radius from CSS tokens (`--chip-bg/-fg/-border/-on-solid/-radius`), so any ancestor can re-skin chips locally without forking. Sibling to `Badge` (which carries semantic status); Chip is a neutral primitive that adopts its surrounding palette. Composes freely — use `<Chip.Dot/>` for the conventional `currentColor` dot, or place any icon before/after the label. Variants: `subtle` (default), `outline`, `filled` — outline uses the shared `--alpha-2` token for its background wash. Tokens live in `tokens/chip.css`.
