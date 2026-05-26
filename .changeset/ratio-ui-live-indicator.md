---
'@eventuras/ratio-ui': minor
---

Add `<LiveIndicator>` at `@eventuras/ratio-ui/core/LiveIndicator` — a pulsing dot + status label. Use for connection status (WebSocket, SignalR, SSE), recording UI, polling monitors, or any "is this happening right now?" affordance. `children` is required so consumers always wire their own (typically translated) label; no English defaults that might leak through missed i18n. Dot color reads from `--live-indicator-dot` (defaults to `--success-solid`); chip chrome is set locally so the page's `--chip-*` defaults stay untouched. Re-skin per status (amber "reconnecting", red "error") via wrapper token overrides. Respects `prefers-reduced-motion`.

Also extends `Chip.Dot` with a `pulse` prop so the expanding-ring animation is available to any chip composition — `LiveIndicator` is now a thin wrapper around `<Chip><Chip.Dot pulse/>…</Chip>`. The keyframe lives in a small `Chip.css` and uses `currentColor`, so the pulse follows whatever color the dot inherits.
