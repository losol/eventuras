---
"@eventuras/ratio-ui": patch
---

Tune `Button` typography, sizing and motion to read leaner and match the design reference:

- **Font weight** dropped from `font-bold` (700) to `font-medium` (500) across all variants. Source Sans 3 at 700 was reading too "loud" against the warm Linseed/Linen surfaces; 500 carries the brand intent without shouting.
- **Sizes stepped down one Tailwind level** so buttons take less vertical real estate and match the design reference more closely:
  - `sm`: `px-3 py-1 text-xs` (was `px-3 py-0.5 text-sm`)
  - `md`: `px-4 py-2 text-sm` (was `px-4 py-1 text-base`)
  - `lg`: `px-6 py-3 text-base` (was `px-6 py-2 text-lg`)
- **Transition** snapped from `duration-500` to `duration-200`. Hover/focus feels instant.
- **Active scale** brought down from `scale-110` (10%) to `scale-[1.04]` (4%). Reads as a deliberate "pressed" cue rather than a bounce.
- Removed `hover:shadow-sm` — buttons in the design don't lift on hover.
- Added explicit `border-transparent` on `primary` and `danger` so the border doesn't fall back to `currentColor` and outline the filled background.
