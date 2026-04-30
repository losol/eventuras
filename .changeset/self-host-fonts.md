---
"@eventuras/ratio-ui": minor
"@eventuras/web": patch
"@eventuras/historia": patch
"@eventuras/idem-admin": patch
"@eventuras/idem-idp": patch
"@eventuras/dev-docs": patch
---

Self-host the brand fonts (Source Serif 4 + Source Sans 3) and drop the Google Fonts CDN dependency.

The fonts ship as variable WOFF2 in the published package, both axes (weight 200–900 + italic) covered. They're exposed as a separate opt-in stylesheet so the bundler keeps them as files rather than inlining them into the main CSS.

```ts
// In your root layout — once
import '@eventuras/ratio-ui/ratio-ui.css';
import '@eventuras/ratio-ui/fonts.css'; // new — adds Source Serif 4 + Source Sans 3
```

Without the `fonts.css` import, the type tokens fall back to the system serif/sans stack defined in `tokens/typography.css` (`ui-serif, Georgia, serif` etc.). Existing apps using the Google Fonts CDN behavior will silently fall back to system fonts after upgrading without the new import.

All apps in this repo (`apps/web`, `apps/historia`, `apps/idem-admin`, `apps/idem-idp`, `apps/dev-docs`) have been migrated to add the `fonts.css` import.

### License

Source Serif 4 and Source Sans 3 are licensed under the SIL Open Font License 1.1. The full license text and copyright notices are bundled with the fonts at `src/fonts/OFL.txt` and ship with the published package.

### WOFF2

The fonts are shipped as WOFF2 (variable). WOFF2 is supported in 97%+ of browsers and is roughly 60–75% smaller than the original variable TTFs (~1 MB total vs ~3 MB). The four files are roughly 137 KB / 168 KB (Sans italic / roman) and 343 KB / 424 KB (Serif italic / roman).

### Why a separate import

Vite's library mode + Tailwind v4's CSS pipeline inline all `@font-face url()` references as base64 data URLs by default, which would have ballooned the bundled `ratio-ui.css`. Shipping `fonts.css` as a hand-written file outside the Vite bundle keeps the URLs intact, lets the consumer's bundler resolve them as separate cacheable assets, and keeps the main CSS small.
