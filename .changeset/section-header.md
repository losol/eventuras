---
"@eventuras/ratio-ui": minor
---

Add compound subcomponents to `Section` for the editorial section-header pattern (eyebrow + serif title with optional CTA link), plus export `ArrowUpRight` from `@eventuras/ratio-ui/icons`.

```tsx
<Section paddingY="lg">
  <Container>
    <Section.Header>
      <Section.Eyebrow>Aktuelle samlinger</Section.Eyebrow>
      <Section.Title>
        Det skjer i <em className="font-serif text-(--primary)">Nordland</em>
      </Section.Title>
      <Section.Link href="#">Se alle</Section.Link>
    </Section.Header>

    {/* …content… */}
  </Container>
</Section>
```

### Subcomponents

- **`Section.Header`** — flex row with `justify-between` + `items-baseline`. Auto-detects `Section.Link` children and pushes them to the right; everything else (eyebrow, title, free markup) stacks on the left. Drop the link to get a single-column header.
- **`Section.Eyebrow`** — small mono-font kicker line, Linseed primary by default. (Hero.Eyebrow uses Ochre accent — sections stay subordinate to the page hero.)
- **`Section.Title`** — serif heading at ~36px, renders as `<h2>` by default (override via `as`). Accepts rich children — wrap accent words in `<em>` with a color class.
- **`Section.Link`** — text link with auto-appended `ArrowUpRight` icon that nudges on hover.

### Icon export

`ArrowUpRight` is now part of the central icon export, alongside the existing `Chevron*` set.

The `Pages/Page Demo` story uses the new pattern in its "What's inside" section.
