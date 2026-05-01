---
"@eventuras/ratio-ui": patch
---

Follow-up to #1383 — fix three issues spotted in review:

- **`Button.tsx`** primary and danger variants used `border` without an explicit color, defaulting to `currentColor`. With the new semantic text tokens (`text-(--text-on-primary)`, `text-error-on`), the border picked up a high-contrast outline against the button fill in dark mode. Now `border-transparent`.
- **`Menu.tsx`** trigger button had the same `border` + `currentColor` issue. Now `border-transparent`.
- **`Link.tsx`** default link styling used hardcoded `decoration-blue-600/30 hover:decoration-blue-800` for the underline color, ignoring the warm Linseed/Linen theme. Switched to `decoration-current/30 hover:decoration-current` so the underline follows the link color.
