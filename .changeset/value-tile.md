---
"@eventuras/ratio-ui": major
"@eventuras/web": patch
---

Replace `NumberCard` with a new `ValueTile` primitive at `@eventuras/ratio-ui/core/ValueTile`, and add a `tile` variant to `Card`.

```tsx
// Convenience API — replaces NumberCard
<ValueTile number={42} label="Total events" />

// Compound API — for editorial stat phrases with rich markup
<ValueTile>
  <ValueTile.Value>
    <em className="text-(--accent)">240+</em> articles
  </ValueTile.Value>
  <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
</ValueTile>

// Card.tile — quieter editorial card surface
<Card variant="tile">
  <Heading as="h4" marginBottom="xs">Tokens</Heading>
  <p className="text-sm text-(--text-muted)">Color scales, typography…</p>
</Card>
```

### `ValueTile`

- Two APIs in one component: a `number` + `label` shorthand (matching the prior `NumberCard` shape) and a compound `ValueTile.Value` + `ValueTile.Caption` for rich editorial markup.
- `orientation?: 'vertical' | 'horizontal'` — defaults to `vertical` (used by Hero side panels and dashboard tiles); `horizontal` lays them out baseline-aligned for inline data displays.
- No surface of its own — wrap in `Card` (e.g. `variant="outline"` or `variant="tile"`) when you want a border or background.
- Adopts the editorial brand typography: serif Linseed-800 display value, small muted caption — replaces the prior cold sans-bold look in `NumberCard`.

### `Card.tile`

New variant: `p-6 rounded-lg border border-(--border-1) bg-(--card)` — a quieter editorial card with the modern surface tokens, separate from the heavier `default` variant.

### Breaking

- **`@eventuras/ratio-ui/visuals/NumberCard` is removed.** Migration: replace
  ```tsx
  <NumberCard number={n} label={l} variant="outline" />
  ```
  with
  ```tsx
  <Card variant="outline" className="text-center">
    <ValueTile number={n} label={l} className="items-center" />
  </Card>
  ```
  `apps/web`'s `EconomySection.tsx` is migrated as part of this change.
