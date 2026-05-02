---
"@eventuras/ratio-ui": minor
---

Give `Container` a responsive default horizontal padding (`px-3 sm:px-4 lg:px-6`) so content stops running edge-to-edge on narrow viewports. Consumers that need a different value or none at all can override via `padding` or `paddingX` (any of those, including `paddingX="none"`, suppresses the default).

Before: at viewport widths below the configured `size`, content rendered flush against the screen edge — visually broken on mobile across most apps that compose with `Container`.

After: 12px / 16px / 24px horizontal breathing room kicks in by default. Matches the convention used by Tailwind's `container` utility, MUI, and Chakra.
