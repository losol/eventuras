---
"@eventuras/ratio-ui": minor
---

Add `Strip` (beta) — a three-column horizontal card primitive for chronological listings, calendar entries, search results, and any dense row-shaped content where date / identity, body, and meta / action separate naturally. Marked `@beta` in JSDoc — prop shape, slot contract, and visual treatment may change before release without major bumps.

```tsx
import { Strip } from '@eventuras/ratio-ui/core/Strip';

<Strip hoverEffect href="/events/123">
  <Strip.Lead>
    <span className="font-mono text-xs uppercase">SEP</span>
    <span className="font-serif text-5xl">14</span>
  </Strip.Lead>
  <Strip.Body>
    <h3 className="font-serif text-xl">Course title</h3>
    <p className="text-sm text-(--text-muted)">Optional headline.</p>
  </Strip.Body>
  <Strip.Trail>
    <span>Venue</span>
    <span>View →</span>
  </Strip.Trail>
</Strip>
```

Layout: `160px / 1fr / 280px` columns above the `md` breakpoint, stacks to one column below it. The leading slot picks up a deeper Linen tint (`bg-secondary-300` light, `bg-primary-900` dark) so it reads as a separate column at a glance; dashed-border separators flip from vertical to horizontal when the strip stacks. Pass `href` to render the strip itself as an anchor — the whole row becomes clickable.

Internal slot separators echo the outer `border` prop, so `border={false}` or `border="none"` yields a truly borderless strip with no internal dividers either.

Inherits Card-tier interactive props: `hoverEffect` (1px lift + primary border + soft glow on hover), `color` (semantic surface tint), `shadow`, `border`, `radius`, and the margin family. Defaults to `shadow="none"` since strips read as flat list rows by default.

Lives next to `Card` rather than under it (no `Card.Strip` namespacing) so the two primitives stay independent — `Card` keeps its single-block contract, `Strip` owns the row pattern.
