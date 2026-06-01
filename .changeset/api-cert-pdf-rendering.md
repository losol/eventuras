---
'@eventuras/api': patch
---

Make the course certificate PDF fill the A4 page with readable text. Three changes:

- `LiquidCertificateRenderer` now renders at `Scale = 1.0` (was `0.8f`), so content is no longer shrunk to ~80% of the paper with a gray band below it.
- Both Liquid templates drop the `@media print` block and apply its rules as defaults — Converto's headless-Chrome render does not always trigger print media, which left the screen-only gray background and the small `font-size: 10px` showing through.
- Base font is `14px` (was `16px`) so body text reads cleanly at the new scale on A4 without crowding the page.
