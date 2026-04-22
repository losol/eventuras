---
"@eventuras/ratio-ui": minor
---

fix(ratio-ui): decouple semantic spacing utilities from Tailwind's spacing scale

`spacing.css` used to alias `--spacing-xs/sm/md/lg/xl` to the fluid
`--space-*` tokens so utilities like `p-md`, `pb-xs`, and `gap-lg`
picked up semantic sizing. Tailwind v4 also derives size utilities
(`max-w-*`, `w-*`, `h-*`, `min-w-*` …) from the same `--spacing-*`
scale, so the override silently shrank every named width utility —
`max-w-lg` came out at 2.25rem instead of the standard 32rem, which is
why Dialog panels and other width-constrained components rendered as
tall narrow columns.

Dropped the `--spacing-*` aliases and defined the semantic spacing
utilities explicitly with `@utility` (scope matches what
`buildSpacingClasses()` in `./spacing.ts` emits: p/px/py/pt/pb,
m/mx/my/mt/mb, gap — each in xs/sm/md/lg/xl). The raw `--space-*`
fluid tokens are untouched.

**Visible effect**: `p-md`, `pb-xs`, `gap-lg` etc. keep working and
keep the same values. `max-w-md/lg/xl` now fall back to Tailwind's
`--container-*` defaults (28/32/36 rem), restoring correct widths in
`Image`, `CommandPalette`, `Error`, `PageOverlay`, and anywhere else
those utilities are used.

**Migration note**: only the explicit set above is generated
automatically now. Classes that previously worked only because
`--spacing-md/lg/xl` existed as Tailwind theme keys — e.g. `pl-md`,
`pr-md`, `space-x-md`, `size-lg` — are no longer generated. A sweep
of `apps/` and `libs/` found no callers, but if one turns up, use
an arbitrary value (`pl-[var(--space-m)]`) or add a dedicated
`@utility` rule in `spacing.css`.
