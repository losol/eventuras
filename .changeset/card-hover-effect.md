---
"@eventuras/ratio-ui": minor
---

Refresh the `Card` `hoverEffect` treatment to match the canonical interactive card pattern, and add two `--shadow-card-hover*` tokens so the glow stays theme-aware.

```tsx
<Card hoverEffect>
  …
</Card>
```

When `hoverEffect` is on, the card now:

- Lifts its surface to `--card-hover`.
- Picks up `--primary` on the border.
- Gains a soft Linseed-tinted glow (`--shadow-card-hover` when the card has a base shadow, `--shadow-card-hover-tile` when `shadow="none"`).
- Transitions snappily — `duration-200`, `ease-out`.

The glow is implemented via two new shadow tokens in `theme.css`:

```css
--shadow-card-hover-tile: 0 4px 12px color-mix(in oklch, var(--primary) 25%, transparent);
--shadow-card-hover:      0 6px 18px color-mix(in oklch, var(--primary) 25%, transparent);
```

Theme-aware automatically via `--primary` (Linseed-600 light, Linseed-400 dark).

The card stays put on hover (no translate) so cursor pass-by doesn't make text twitch. Reserve `hoverEffect` for cards that act as clickable surfaces.
