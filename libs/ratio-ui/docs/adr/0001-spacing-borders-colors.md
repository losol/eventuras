# ADR-0001: Unified spacing, border, and color prop APIs for 1.0

## Status

Draft

## Context

ratio-ui is approaching 1.0 and has accumulated several inconsistencies in how spacing, borders, and colors are expressed through component props.

### Spacing: three gap scales, untyped padding/margin

| Surface | Scale | Example values |
|---------|-------|----------------|
| `BoxSpacingProps.gap` | Tailwind numeric | `'0' \| '1' \| '2' \| … \| '8'` |
| `Stack.gap` | Semantic | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` |
| `gridGapClasses` | Responsive subset | `'4' \| '6' \| '8'` |

`padding` and `margin` are `string` — any Tailwind class is accepted, so there are no design-system guardrails.

Fluid spacing tokens exist in `tokens/spacing.css` (`--space-3xs` through `--space-3xl`) but no component prop references them.

### Borders: mixed into spacing

`BoxSpacingProps` includes `border?: string` alongside padding and margin. This conflates concerns — border is visual decoration, not spacing. Components like Panel hardcode borders in CSS; others accept arbitrary Tailwind border strings.

Border tokens exist (`--radius-sm`, `--radius`, `--radius-lg`, `--radius-xl`, `--border-1`, `--border-2`) but are not surfaced through component props.

### Colors: inconsistent vocabulary

- `Text.color`: `'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning' | 'info'`
- `Panel.intent`: `'info' | 'success' | 'warning' | 'error' | 'neutral'`
- `Button.variant`: mixes color + shape (`'primary' | 'secondary' | 'light' | 'text' | 'outline'`)
- `backgroundColorClass`: raw string

No shared `Status` or `Color` type.

### BoxSpacingProps: mixed concerns

`BoxSpacingProps` bundles spacing (`padding`, `margin`, `gap`), sizing (`width`, `height`), and decoration (`border`). Components like Text and Heading inherit width/height/border props they shouldn't need.

### BoxProps: unnecessary indirection

`BoxBackgroundProps` adds `backgroundColorClass` (just a className) and `backgroundImageUrl` (just an inline style). `SizingProps` adds `width` and `height` as raw strings. None of these provide type safety — they just move raw strings into dedicated props.

### Button default margin

`Button` defaults to `margin="m-1"`, applying outer spacing from within the component. This conflicts with the principle that parents control spacing between children.

### Panel: BEM modifier-based variant styling

Panel uses a separate `Panel.css` with BEM modifier classes (`panel--info`, `panel--success`) to express its intent/variant combinations. Several other components also have CSS files (Card, Link, Blockquote, Schedule), but Panel is the only one that uses BEM modifiers for its variant styling rather than Tailwind utility class mappings.

## Decision

### 1. Reduced semantic spacing scale

Use a **6-step semantic scale** for all spacing props (gap, padding, margin):

```typescript
export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
```

This maps to Tailwind utilities backed by the fluid CSS tokens:

| Token | CSS variable | Tailwind class | ~rem |
|-------|-------------|----------------|------|
| `none` | — | `gap-0` / `p-0` | 0 |
| `xs` | `--space-xs` | `gap-xs` / `p-xs` | 0.875 |
| `sm` | `--space-s` | `gap-sm` / `p-sm` | 1.125 |
| `md` | `--space-m` | `gap-md` / `p-md` | 1.6875 |
| `lg` | `--space-l` | `gap-lg` / `p-lg` | 2.25 |
| `xl` | `--space-xl` | `gap-xl` / `p-xl` | 3.375 |

The CSS tokens `--space-2xs`, `--space-3xs`, `--space-2xl`, and `--space-3xl` remain available via `className` for edge cases, but are not part of the typed prop API. Six steps is enough for virtually all component-level decisions; fewer choices means faster decisions for consumers.

Note: the Tailwind utility classes (`p-xs`, `gap-md`, etc.) do not exist yet — they are created by extending the Tailwind v4 theme as described in the [implementation approach](#tailwind-v4-theme-extension) below.

The `gridGapClasses` utility is removed — components use the same `Space` scale.

### 2. Separated prop interfaces

Replace `BoxSpacingProps` with focused interfaces:

```typescript
/** Spacing: padding, margin, gap */
export interface SpacingProps {
  padding?: Space;
  paddingX?: Space;
  paddingY?: Space;
  margin?: Space;
  marginX?: Space;
  marginY?: Space;
  gap?: Space;
}

/** Borders: width, color, radius */
export interface BorderProps {
  border?: boolean | BorderVariant;
  borderColor?: 'default' | 'subtle' | 'strong' | Color;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/** Sizing: width and height (remain flexible strings) */
export interface SizingProps {
  width?: string;
  height?: string;
}
```

Where `BorderVariant` controls the style:

```typescript
export type BorderVariant = 'default' | 'strong' | 'subtle';
```

- `border={true}` or `border="default"` — standard 1px border with `--border-1`
- `border="strong"` — 2px or uses `--border-2`
- `border="subtle"` — lighter/dashed
- `borderColor` maps to semantic tokens — `'default'` uses `--border-1`, status values (`'error'`, `'success'`, …) use the corresponding color
- `radius` maps to `--radius-*` tokens

This gives borders a proper typed API instead of raw Tailwind strings, while keeping the number of options manageable.

### 3. Shared color and status types

```typescript
/** Full semantic color palette */
export type Color =
  | 'neutral' | 'primary' | 'secondary' | 'accent'
  | 'success' | 'warning' | 'error' | 'info';

/** Status subset — for components that signal state (Panel, Badge, ErrorPage) */
export type Status = 'neutral' | 'success' | 'warning' | 'error' | 'info';
```

`Color` is the full palette — used by Text, Heading, BorderProps, and anywhere the full range makes sense.

`Status` is the status subset — used by Panel, Badge, ErrorPage, and components that communicate state/feedback. Keeping this as a narrower type prevents nonsensical combinations like a "secondary" alert.

Button keeps its `variant` prop (since it conflates visual style with color), but buttons that need status coloring can accept `status` as an additional prop in the future.

### 4. Remove `backgroundColorClass`, `backgroundImageUrl`, and `SizingProps` from BoxProps

The current `BoxBackgroundProps` (`backgroundColorClass`, `backgroundImageUrl`) and `SizingProps` (`width`, `height`) are removed from the typed API:

- `backgroundColorClass` is just a className — use `className="bg-primary-100"` instead.
- `backgroundImageUrl` is just an inline style — use `style` directly instead.
- `width` and `height` have too many possible values to meaningfully constrain. Use `className="w-full"` etc.

These were convenience wrappers that added indirection without adding type safety.

### 5. Simplified BoxProps

```typescript
export type BoxProps =
  & SpacingProps
  & BorderProps
  & {
    as?: ElementType;
    className?: string;  // escape hatch for sizing, backgrounds, etc.
    style?: CSSProperties;
    children?: ReactNode;
  };
```

`className` is the escape hatch for anything not covered by typed props: sizing, backgrounds, arbitrary Tailwind classes, unusual spacing values, etc.

### 6. No default margin on Button

The current `Button` defaults to `margin="m-1"`. Components should not apply outer margin by default — spacing between elements is the parent's responsibility (via Stack gap, grid gap, or explicit margin from the consumer). The default becomes `undefined`.

### 7. Panel migrates from BEM CSS to Tailwind

Panel is the only component that uses BEM modifier classes (`panel--info`, `panel--success`) for variant styling. For consistency, Panel moves to Tailwind classes via Record maps. The `intent` prop is renamed to `status` and uses the shared `Status` type.

### 8. Color shades are not exposed as props

`Color` stays semantic (`'primary'`, not `'primary-200'`). Each component maps a `Color` value to the appropriate shade for its context (text, background, border), including dark mode adaptation. Specific shades are available via `className` when needed, but the typed API intentionally abstracts this away — the component knows best which shade works in its context.

### 9. Adoption rule

For 1.0, every component that renders a container element should accept `className`. Layout-oriented components (Box, Stack, Card, Section, Container) accept `SpacingProps`. Components that visually contain content (Panel, Card, Badge) accept `BorderProps`. All components that currently extend `BoxSpacingProps` migrate to the new interfaces.

## Implementation approach

### Tailwind v4 theme extension

Register the spacing scale as Tailwind utilities in `tokens/spacing.css`:

```css
@theme {
  --spacing-xs: var(--space-xs);
  --spacing-sm: var(--space-s);
  --spacing-md: var(--space-m);
  --spacing-lg: var(--space-l);
  --spacing-xl: var(--space-xl);
}
```

This enables `p-xs`, `gap-lg`, `m-md` etc. as standard Tailwind classes. The prop names and class names use the same vocabulary.

### Mapping function

Replace `buildSpacingClasses` with typed mappers:

```typescript
const spaceMap: Record<Space, string> = {
  'none': '0',
  'xs': 'xs',
  'sm': 'sm',
  'md': 'md',
  'lg': 'lg',
  'xl': 'xl',
};

export function buildSpacingClasses(props: SpacingProps): string { /* ... */ }
export function buildBorderClasses(props: BorderProps): string { /* ... */ }
```

### Migration path

This is a breaking change. Recommended approach:

1. Add the new types and mapping functions alongside the existing ones
2. Update components one by one, component per component
3. Update consuming apps
4. Remove old `BoxSpacingProps` and `buildSpacingClasses`

## Consequences

### Positive

- Single spacing vocabulary across all components
- Borders get proper typed API instead of raw strings
- Shared `Color` / `Status` types prevent drift between components
- Fewer choices (6 vs 9+ spacing steps) — faster decisions for consumers
- Fluid spacing tokens are finally connected to component props
- `className` escape hatch means no loss of flexibility

### Negative

- Breaking change for all components and consumers
- Raw string props were maximally flexible; typed props add constraints
- Migration effort across the codebase

### Risks

- Six spacing steps might prove too few for some layouts (mitigated by `className` escape hatch)
- Border API may need to grow if components need more nuanced border control (e.g., per-side borders)
