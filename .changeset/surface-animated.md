---
"@eventuras/ratio-ui": major
---

Replace the always-on animated body background with a reusable `.surface-animated` utility class. **Breaking**: existing apps that imported `global.css` and got the gradient blobs by default will now see a flat `var(--surface)` body. To restore the effect, add `surface-animated` to your `<body>` (or any block element).

```tsx
{/* Body-wide drift */}
<body className="surface-animated">…</body>

{/* Single accent block */}
<Section className="surface-animated" paddingY="xl">…</Section>

{/* Card surface */}
<Card variant="default" className="surface-animated">…</Card>
```

### What changed

- **Default body** — flat `background-color: var(--surface)`, no gradient/grain. Matches the canonical design reference.
- **`.surface-animated`** — opt-in class that layers a brand-tinted gradient drift behind the content. Five soft blobs in `--primary` / `--accent` / `--secondary`, drawn via `oklch(from var(--…) l c h / α)` so the palette is theme-aware automatically. Blobs cluster near the top-right for a "sunlit corner" feel.
- **Subtle by design** — alpha 0.07–0.10, blobs sized 90–110% with transparent stops at 90–95%. Hints at depth without overpowering content.
- **Translate-only animation**, 12s alternating drift. No scale (which momentarily exposed a hard rectangle), no `translate3d` (which auto-promoted to a compositor layer that escaped `overflow: hidden`).
- **`inset: -8%`** on the `::before` so the gradient's outer edge is always clipped by the parent — no visible rectangle even mid-animation.
- **`prefers-reduced-motion: reduce`** turns the animation off.

### Migration

Apps relying on the previous default-on body gradient need a one-line addition to their root layout:

```tsx
// before
<body>{children}</body>

// after
<body className="surface-animated">{children}</body>
```

Apps that didn't want the gradient (admin dashboards etc.) gain a cleaner default with no work.
