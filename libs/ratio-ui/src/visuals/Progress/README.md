# Progress

Animated progress components for displaying scores, completion, or other values relative to a maximum.

## Components

### ProgressRing

Circular gauge with content centered inside the ring.

```tsx
import { ProgressRing } from '@eventuras/ratio-ui/visuals/Progress';

<ProgressRing value={50.4} max={70} color="primary" size={100} strokeWidth={7}>
  <span className="text-xl font-bold">50.4</span>
  <span className="text-xs text-gray-500">of 70</span>
</ProgressRing>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `max` | `number` | `100` | Maximum value |
| `color` | `ProgressColor` | `'primary'` | Semantic name or CSS color value |
| `size` | `number` | `120` | Outer diameter in px |
| `strokeWidth` | `number` | `8` | Arc thickness in px |
| `roundCaps` | `boolean` | `false` | Round the arc ends |
| `label` | `string` | — | Accessible name (falls back to `"{value} of {max}"`) |
| `children` | `ReactNode` | — | Content centered in the ring |
| `className` | `string` | — | Additional classes on wrapper |

### ProgressBar

Horizontal bar with optional label and value display.

```tsx
import { ProgressBar } from '@eventuras/ratio-ui/visuals/Progress';

<ProgressBar value={52} max={70} color="primary" label="Your score" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `max` | `number` | — | Maximum value |
| `color` | `ProgressColor` | `'primary'` | Semantic name or CSS color value |
| `height` | `number` | `8` | Height in px |
| `label` | `string` | — | Text above left side |
| `showValue` | `boolean` | `true` | Show `value / max` above right side |
| `className` | `string` | — | Additional classes on wrapper |

## Which one should you use?

- **ProgressRing** when the value is the central focus — typically a single key metric in a dashboard or card. The ring carries visual weight and works well standalone.
- **ProgressBar** when showing progress in a list, table, or as part of a denser layout. Takes less vertical space and scales naturally with width.

They pair well together: a ring as the "hero" element at the top, with bars for the details below.

## Color usage

Both components accept a `color` prop. Use semantic token names for consistency:

```tsx
// Semantic names (recommended)
color="primary"    // default
color="success"    // green — complete, good result
color="warning"    // yellow — partial, needs attention
color="error"      // red — low, critical
color="info"
color="neutral"

// Raw CSS values also work
color="#188097"
color="var(--my-custom-color)"
```

## Accessibility

- `ProgressRing` uses `role="meter"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
- `ProgressBar` uses `role="progressbar"` with the same aria attributes.
- Ring content (`children`) is visible to screen readers. Make sure it reads well as plain text.

## Animation

Both components animate from 0 to the actual value on mount. The animation is triggered via `requestAnimationFrame` to ensure the CSS transition runs after the first paint. There is no prop to disable animation — if needed, add an `animated?: boolean` prop.
