---
"@eventuras/ratio-ui": major
"@eventuras/toast": major
---

### Unified spacing, border, color, and status APIs (ADR-0001)

Major prop cleanup across ratio-ui in preparation for 1.0. The goal:
typed semantic props instead of raw Tailwind strings, a single shared
`Status` vocabulary across all status-bearing components, and consistent
HTML attribute forwarding.

#### New shared types and utilities

- `Space` — 6-step semantic spacing scale (`'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`),
  backed by fluid CSS tokens
- `SpacingProps` — `padding`, `paddingX`, `paddingY`, `paddingTop`, `paddingBottom`,
  `margin`, `marginX`, `marginY`, `marginTop`, `marginBottom`, `gap` — all typed as `Space`
- `BorderProps` — typed `border`, `borderColor`, `radius` props
- `Color` — full semantic palette (`neutral`, `primary`, `secondary`, `accent`,
  `success`, `warning`, `error`, `info`)
- `Status` — status subset (`neutral`, `success`, `warning`, `error`, `info`)
- `buildSpacingClasses(props)` and `buildBorderClasses(props)` — typed mappers
  exported from `@eventuras/ratio-ui/tokens`
- `cn(...inputs)` — `clsx` + `tailwind-merge`, exported from
  `@eventuras/ratio-ui/utils`
- `buildCoverImageStyle(url, style?, overlay?)` — exported from
  `@eventuras/ratio-ui/utils`

#### Tailwind v4 theme extension

`tokens/spacing.css` now registers `--spacing-xs` through `--spacing-xl` so
that `p-xs`, `gap-md`, `m-lg` etc. work as standard Tailwind utilities.

#### Component changes

Component props migrated from raw Tailwind strings to the new typed APIs:

- **Box** — uses `SpacingProps` + `BorderProps`. `BoxSpacingProps`,
  `BoxBackgroundProps`, `BoxContentProps`, and the old `buildSpacingClasses`
  are removed. `getBackgroundStyle` is renamed to `buildCoverImageStyle` and
  moved to `utils/`.
- **Stack** — `gap` uses the shared `Space` type. The `'2xl'` value is removed.
- **Container** — uses `SpacingProps` + forwards HTML attrs.
- **Section** — single Section component at `layout/Section`. The old
  `core/Section` is removed. `container`, `grid`, `backgroundColorClass`,
  `backgroundImageUrl`, and `backgroundImageOverlay` props removed; consumers
  use `<Container>` wrapping, `className`, and `style={buildCoverImageStyle(...)}`
  directly. New typed `color?: Color` prop for surface colors.
- **Card** — uses `SpacingProps` + `BorderProps`. `dark`, `container`, `grid`,
  and `backgroundColorClass` props removed. New typed `color?: Color` prop.
  `Card.css` removed; surface tokens live in `tokens/theme.css` (`--card`,
  `--card-hover`).
- **Button** — default `margin="m-1"` removed (parents control spacing).
  `padding`, `margin`, `border`, `width`, `height` props removed.
- **ButtonGroup** — uses `SpacingProps` + forwards HTML attrs.
- **Heading**, **Text**, **Lead**, **Link** — use `SpacingProps`. `border`,
  `width`, `height` props removed.
- **Text**, **Lead** — `text`/`children` props are now a discriminated union;
  passing both is a compile-time error instead of a runtime throw.
- **Story**, **StoryHeader**, **StoryBody**, **StoryFooter** — use
  `SpacingProps` + forward HTML attrs.
- **Panel** — `intent` prop renamed to `status`, uses shared `Status` type.
  `Panel.css` removed; classes mapped via Tailwind Records using design tokens.
- **Badge** — `variant` renamed to `status`. `'positive'`/`'negative'` removed
  in favor of `'success'`/`'error'`. `'warning'` added. Uses shared `Status`.
- **Toast** — `ToastType` enum removed. `type` field renamed to `status`,
  uses shared `Status`. New `warning` variant.
- **PageOverlay** — `variant` renamed to `status`. `'default'` becomes
  `'neutral'`. Uses shared `Status`.
- **Error block** — `tone` renamed to `status`. Uses shared `Status`.
- **ErrorPage** — `tone` renamed to `status`. `'fatal'` renamed to `'error'`.
  Uses shared `Status`.
- **DescriptionList** — now a compound component. Use
  `<DescriptionList.Item>`, `<DescriptionList.Term>`,
  `<DescriptionList.Definition>`, or the new `<DescriptionList.Description term="...">`
  shortcut. The standalone `Item`, `Term`, `Definition` exports are removed.
- **Dialog** — `DialogModal` and `DialogModalProps` are no longer exported
  (internal implementation detail).

#### Other cleanups

- All `default exports` replaced with named exports (~25 components). Menu
  retains `Object.assign` compound pattern.
- `gridGapClasses` and `getGridClasses` removed (no consumers).
- `tailwind-merge` added as a dependency.
- New `testId` prop on Container, Section, Card, Heading, ButtonGroup, and
  Story blocks for consistency with other components.
- New export paths: `@eventuras/ratio-ui/tokens` and `@eventuras/ratio-ui/utils`.

#### Migration

For most consumers, the migration is mechanical:

```tsx
// Before
<Heading as="h2" padding="pb-3">Title</Heading>
<Section padding="py-8" backgroundColorClass="bg-gray-50 dark:bg-gray-900">
<Badge variant="positive">Active</Badge>
<Panel variant="alert" intent="error">Error</Panel>

// After
<Heading as="h2" paddingBottom="xs">Title</Heading>
<Section paddingY="lg" color="neutral">
<Badge status="success">Active</Badge>
<Panel variant="alert" status="error">Error</Panel>
```

For unusual spacing values that don't map to the semantic scale, use
`className` as the escape hatch.
