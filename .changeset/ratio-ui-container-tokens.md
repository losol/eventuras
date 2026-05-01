---
'@eventuras/ratio-ui': major
---

Container: redesign API around layout tokens

- Add `size` prop (`'sm' | 'md' | 'lg' | 'xl' | 'full'`) with default `'lg'`
  for explicit max-width control. Replaces Tailwind's `container` class.
- Adopt the same composable token API as `Card`: `SpacingProps`,
  `BorderProps`, `color`, polymorphic `as`.
- Remove hardcoded `px-3 pb-18`. Container no longer applies any
  default padding — use `paddingX` / `paddingY` (or wrap in a `Section`)
  when you need it.
- Container only auto-centers (`mx-auto`) when no `margin`/`marginX` is
  set, so explicit horizontal margins now work as expected.

Also: refresh the fluid spacing scale (`--space-*`) with a tighter,
more geometric ramp (base `s` ≈ 14→16px, `xs` ≈ 11→12px) so `xs` is
visibly smaller than the base step. Adds Utopia "one-up" pairs and the
`--space-s-l` custom pair (also available for callers).

Migration:

- Pages relying on the previous bottom padding should add `paddingBottom`
  (e.g. `paddingBottom="lg"`) or wrap content in a `Section`. Likewise,
  pages that depended on the previous horizontal `px-3` should add
  `paddingX` explicitly.
- Custom widths previously achieved via `className="w-full"` should use
  `size="full"` instead.
- The spacing scale is slightly smaller across the board; review tight
  layouts that depended on exact pixel values from the old scale.
