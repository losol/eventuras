---
"@eventuras/ratio-ui": minor
---

Add `Heading.Group` and `Heading.Eyebrow` compound subcomponents, then refactor `Section` and `Hero` to delegate their eyebrow/title pairs to them. The compound API surface of `Section.Eyebrow`, `Section.Title`, `Hero.Eyebrow`, and `Hero.Title` is unchanged — this is an internal consolidation so all three components share one set of heading primitives.

```tsx
<Heading.Group>
  <Heading.Eyebrow>The library</Heading.Eyebrow>
  <Heading as="h2">What's inside</Heading>
</Heading.Group>
```

### New primitives

- **`Heading.Group`** — renders `<hgroup>`, the semantic HTML element for a heading paired with an eyebrow, kicker, or tagline. Screen readers announce the pair as a single heading unit.
- **`Heading.Eyebrow`** — small mono-font kicker line. `tone="primary"` (default) uses Linseed primary — quieter, for subordinate body sections. `tone="accent"` uses Ochre accent — louder, for the page hero.

### Internal refactors

- `Section.Eyebrow` delegates to `Heading.Eyebrow` (tone `"primary"`).
- `Section.Title` delegates to `Heading` with the section-tier serif styling.
- `Section.Header` wraps its left column in `Heading.Group`, so the eyebrow + title pair renders inside an `<hgroup>` automatically.
- `Hero.Eyebrow` delegates to `Heading.Eyebrow` (tone `"accent"`, with hero-tier size overrides).
- `Hero.Title` delegates to `Heading` with the hero-tier serif styling.
