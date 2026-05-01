---
"@eventuras/ratio-ui": patch
---

Differentiate `Card` `default` and `tile` variants more clearly:

- **`default`** — elevated card: 1px `border-border-2` (visible hairline), `rounded-xl`, `shadow-sm` (up from `shadow-xs`). Reads as "lifted" — for primary content surfaces.
- **`tile`** — flat editorial card: 1px `border-border-1` (subtle hairline), `rounded-lg`, no shadow, roomier padding. Reads as "quiet" — for content tiles in grids.
- **`outline`** — unchanged (1px `border-border-1`, transparent fill, no shadow).

The visual hierarchy now comes from three axes — border tone (`border-2` louder vs `border-1` quieter), radius (`xl` vs `lg`), and elevation (`shadow-sm` vs none) — rather than border width. All three border-bearing variants share the 1px hairline so the system reads as one family.
