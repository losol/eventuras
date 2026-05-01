---
"@eventuras/ratio-ui": major
---

**Breaking:** Remove the always-on animated gradient background that `body::before` and `body::after` painted across every consumer of `global.css`. The body now uses a flat `background-color: var(--surface)` only, matching the canonical design reference.

The animated layer had compounding structural costs — `position: fixed` blobs that mid-animation escaped `overflow: hidden` rounded corners, percentage-radius `circle` gradients that silently dropped, Tailwind v4's color-mix polyfill stripping the gradient on certain pipelines, and `> * { position: relative; z-index: 1 }` mutating the positioning context of every direct child. The earlier rescue attempt (PR #1396, opt-in `.surface-animated` utility) was closed without merging because the same overflow/scroll and isolation problems resurfaced.

The static surface tokens already give consumers the warm Linen-200 / primary-950 ground we wanted from the gradient. Apps that still want decorative drift can build it as a per-block opt-in pattern that doesn't touch consumer positioning.
