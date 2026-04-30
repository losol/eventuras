---
"@eventuras/ratio-ui": minor
---

Add `<Hero>` block — an editorial-pattern section for the top of a page.

Compose with `Hero.Main` (left column with eyebrow, title, lead, actions) and optionally `Hero.Side` (right column for stats, asides, secondary CTAs). When `Hero.Side` is omitted the layout collapses to a single column. Pairs with the surface-token system via `dark`.

```tsx
import { Hero } from '@eventuras/ratio-ui/blocks/Hero';

<Hero>
  <Hero.Main>
    <Hero.Eyebrow>A knowledge platform</Hero.Eyebrow>
    <Hero.Title>
      Build something <em className="font-serif text-(--primary)">considered</em>,{' '}
      <em className="font-serif text-(--accent)">curated</em>, and worth coming back to.
    </Hero.Title>
    <Hero.Lead>A place for long-form articles and editorial collections ...</Hero.Lead>
    <Hero.Actions>
      <Button variant="primary" size="lg">Browse the library</Button>
    </Hero.Actions>
  </Hero.Main>
  <Hero.Side>
    {/* freeform — stat blocks, image, supplementary content */}
  </Hero.Side>
</Hero>
```

### Subcomponents

- `Hero.Main` — left column wrapper
- `Hero.Side` — right column wrapper (border-left divider, hidden on mobile)
- `Hero.Eyebrow` — small mono-font ochre kicker line above the title
- `Hero.Title` — large serif heading, `<h1>` by default (configurable via `as`). Accepts rich children — wrap accent words in `<em>` with a color class for the editorial italic look.
- `Hero.Lead` — body lead paragraph, muted text, `max-w-[44ch]`
- `Hero.Actions` — flex row of CTA buttons

### Why a block, not just classes

The hero pattern (eyebrow + serif title + lead + actions, optionally with a stat panel divider on the right) shows up across multiple Eventuras-platform tenants. Codifying it as a compound block means the editorial proportions (line-height 1.05, balanced text, `--space-2xl` padding, `1.4fr/1fr` grid) are preserved across consumers without each one re-implementing them.

The `Pages/Page Demo` story is updated to use `<Hero>` rather than hand-rolling the layout.
