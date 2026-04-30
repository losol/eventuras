---
"@eventuras/ratio-ui": major
---

Replace the brand palette with **Linseed Blue / Linen / Ochre** — a quieter, naturmaling-inspired identity that sits closer to the editorial knowledge-platform voice the system is moving toward.

| Token | Before | After |
|---|---|---|
| `--color-primary-*` | Ocean Teal | **Linseed Blue** — chalky pigment, "linoljemaling" |
| `--color-secondary-*` | Sunny Yellow | **Linen** — warm off-white, low-chroma cream |
| `--color-accent-*` | Warm Terracotta | **Ochre** — warm clay-yellow |

### Semantic tokens — what changed

The mapping from scales to semantic tokens shifts to match how the new palette wants to be used:

- `--primary` now resolves to `--color-primary-600` (Linseed-600 — AAA contrast on Linen for links/CTAs)
- `--secondary` resolves to `--color-secondary-200` (Linen-200 — the page surface itself)
- `--accent` resolves to `--color-accent-700` (Ochre-700 — the warm note, sparingly used)
- `--text-light` now uses `--color-secondary-100` (warm Linen) instead of cold `--color-neutral-50`
- `--text-on-primary` and `--text-on-accent` use `--color-secondary-100` for the same reason

### New: `--surface` token

Pages are no longer pure white. A new `--surface` token (`--color-secondary-200` light / `--color-primary-950` dark) is set on `html { background }` so every consumer gets the warm Linen ground in light mode and a deep Linseed-blue ground in dark mode — same DNA, different gravity. Exposed as the `bg-surface` Tailwind utility.

### Dark mode

Anchors lift one step lighter to glow on the dark surface (primary 600→400, accent 700→300). Text stays in the **Linen** family rather than the cold Neutral one — `--text` is `--color-secondary-200` instead of `--color-neutral-50`. Cards lift from the Linseed-950 surface with a pinned `oklch(0.220 0.040 232)` instead of `rgb(0 0 0 / 0.5)`.

### Borders

`--border-1` and `--border-2` now derive from the Linen scale in light mode (Linen-300 / Linen-400) and the Linseed scale in dark mode (Linseed-800 / Linseed-700). Both palettes give borders that belong to their surface rather than fighting it.

### What this means for consumers

- Components using `--color-primary-*`, `--color-secondary-*`, `--color-accent-*` Tailwind utilities (`bg-primary-500`, `text-accent-700`, etc.) keep working — only the actual colors change.
- Anything using semantic tokens (`var(--primary)`, `bg-primary`, `text-accent`) automatically picks up the new look.
- Apps that hardcoded the old hex colors anywhere (rare) will need to update.
- The decorative `body::before` animated gradient in `global.css` is now palette-aware — its rgba values are replaced with `oklch()` stops drawn from the Linseed/Linen/Ochre scales, and its `background-color` references `var(--surface)`. Same effect, but the colors track the active palette instead of being frozen to the old Mediterranean tones.
