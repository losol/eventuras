---
"@eventuras/ratio-ui": minor
---

Refresh the `Card` `hoverEffect` treatment to match the canonical interactive card pattern, and add two `--shadow-card-hover*` tokens so the glow stays theme-aware. Tuned to hint, not shout.

```tsx
<Card variant="tile" hoverEffect>
  …
</Card>
```

When `hoverEffect` is on, the card now:

- Lifts its surface to `--card-hover`.
- Picks up `--primary` on the border.
- Translates 1px upward (`-translate-y-px`).
- Gains a low-alpha Linseed-tinted glow (`--shadow-card-hover` for `default`/`outline`/`wide`/`transparent`, `--shadow-card-hover-tile` for the smaller `tile`).
- Transitions snappily — `duration-200` instead of `300`.

Two new shadow tokens in `theme.css`, theme-aware automatically via `--primary`:

```css
--shadow-card-hover-tile: 0 2px 6px  color-mix(in oklch, var(--primary) 12%, transparent);
--shadow-card-hover:      0 3px 10px color-mix(in oklch, var(--primary) 15%, transparent);
```

Reserve `hoverEffect` for cards that act as clickable surfaces — static cards should leave it off so the page doesn't twitch on cursor pass-by.
