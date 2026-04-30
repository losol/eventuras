---
"@eventuras/ratio-ui": major
---

Replace per-component `onDark` / `bgDark` props with a CSS-variable-based surface token system.

### Why

Five components (`Heading`, `Button`, `Link`, `Navbar`, plus a few more transitively) had ad-hoc boolean props for "I am rendered on a dark surface, use light text". This required prop-drilling on every child of a hero/navbar/footer, was easy to forget, and produced inconsistent naming (`onDark` on three components, `bgDark` on `Navbar`).

The new approach uses CSS cascade: a parent declares the surface tone with one className, and any component inside automatically reads the right text color via `var(--text)`.

### New API

```tsx
// Before
<Section style={heroBg}>
  <Heading onDark>Find knowledge</Heading>
  <Link variant="button-primary" onDark>Get started</Link>
</Section>

<Navbar bgDark overlay glass>
  ...
</Navbar>

// After
<Section style={heroBg} className="surface-dark">
  <Heading>Find knowledge</Heading>
  <Link variant="button-primary">Get started</Link>
</Section>

<Navbar overlay glass className="surface-dark">
  ...
</Navbar>
```

`surface-dark` and `surface-light` are utility classes that override `--text` for the subtree. They're safelisted in `global.css`.

### What was removed

- `Heading.onDark`
- `Button.onDark`
- `Link.onDark`
- `Navbar.bgDark`
- The internal `--navbar-color` variable (now reads `--text` directly)

### What changed under the hood

- `Heading` always reads `text-(--text)` (theme-aware default, surface-class overridable)
- `Button`'s transparent variants (`text`, `outline`) read `text-(--text)`. Filled variants (`primary`, `secondary`, `light`, `danger`) keep their hardcoded text colors.
- `Link`'s variant-styled links read `text-(--text)`. The default underlined link keeps its blue/blue-400 theme-aware colors. `button-primary` keeps its light-on-primary text.
- `Navbar`, `Navbar.Brand`, `Navbar.Content` all read `text-(--text)`.

### Migration

Find any callsite passing `onDark` or `bgDark`:

1. Drop the prop.
2. Add `className="surface-dark"` (or `surface-light`) on the *container* with the colored background — usually a `<Section>`, `<Navbar>`, hero `<div>`, etc.

Internal callsites in `apps/web`, `apps/historia`, and `apps/idem-admin` have been migrated.

### Future direction

Only `--text` is overridden today. The same pattern will extend naturally to `--text-muted`, `--border`, and other tokens as components need them — without growing the prop API of every individual component.
