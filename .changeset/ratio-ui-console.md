---
'@eventuras/ratio-ui': minor
---

Add `<Console>` at `@eventuras/ratio-ui/console` — a themable presentational log/event console (light / dark / retro CRT) with sticky title bar, severity-tagged rows, sticky time-bucket groups, controlled inline expand for detail payloads, and container-query responsiveness that collapses columns based on the console's own width.

Final piece of the chip/button/indicator stack: composes `Chip` for the env tag and severity badge, `LiveIndicator` for the live-tail status, and `ActionButton` for chrome buttons. Themed containers re-skin those primitives via local CSS-variable overrides — no per-theme rules per primitive.

Pure presentation: consumers own data, expansion, pause/play, filter selections, and scroll. Use for streaming logs, business-event feeds, audit trails, liveblogs. Lives as its own top-level folder (like `toast/`) to give room for upcoming logic helpers (auto-scroll, stream adapters, filter utilities) without crowding `core/`.

Also adds `tokens/retro.css` with the shared retro palette (used by `Console`'s `--theme-retro`, available to any future component wanting the CRT aesthetic) and `--debug-*` status tokens.
