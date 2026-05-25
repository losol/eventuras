---
'@eventuras/ratio-ui': minor
---

Fix `<Chip>` variants. The previous `outline` and `filled` variants used `bg-current` to inherit a parent's `color` for tinting — but Chip's own `text-(--chip-fg)` override resolved `currentColor` to the chip's own text color, making `filled` chips render as muted bg + muted text (invisible label) and `outline` chips render as gray instead of tinted. Simplified to two token-driven variants: `subtle` (default — filled background via `--chip-bg`) and `outline` (transparent background, `--chip-border` outline). To tint chips per status, wrap in a container that overrides `--chip-bg/-fg/-border` with the semantic palette. The `filled` variant is removed; consumers wanting a solid-color chip override `--chip-bg` directly.
