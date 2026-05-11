# @eventuras/idem-admin

## 0.1.10

### Patch Changes

- Updated dependencies [991b508]
- Updated dependencies [745a994]
- Updated dependencies [b399eb5]
  - @eventuras/ratio-ui@2.2.0
  - @eventuras/ratio-ui-next@0.1.24

## 0.1.9

### Patch Changes

- Updated dependencies [2842f02]
  - @eventuras/ratio-ui@2.1.0
  - @eventuras/ratio-ui-next@0.1.23

## 0.1.8

### Patch Changes

- da8ba03: Self-host the brand fonts (Source Serif 4 + Source Sans 3) and drop the Google Fonts CDN dependency.

  The fonts ship as variable WOFF2 in the published package, both axes (weight 200–900 + italic) covered. They're exposed as a separate opt-in stylesheet so the bundler keeps them as files rather than inlining them into the main CSS.

  ```ts
  // In your root layout — once
  import "@eventuras/ratio-ui/ratio-ui.css";
  import "@eventuras/ratio-ui/fonts.css"; // new — adds Source Serif 4 + Source Sans 3
  ```

  Without the `fonts.css` import, the type tokens fall back to the system serif/sans stack defined in `tokens/typography.css` (`ui-serif, Georgia, serif` etc.). Existing apps using the Google Fonts CDN behavior will silently fall back to system fonts after upgrading without the new import.

  All apps in this repo (`apps/web`, `apps/historia`, `apps/idem-admin`, `apps/idem-idp`, `apps/dev-docs`) have been migrated to add the `fonts.css` import.

  ### License

  Source Serif 4 and Source Sans 3 are licensed under the SIL Open Font License 1.1. The full license text and copyright notices are bundled with the fonts at `src/fonts/OFL.txt` and ship with the published package.

  ### WOFF2

  The fonts are shipped as WOFF2 (variable). WOFF2 is supported in 97%+ of browsers and is roughly 60–75% smaller than the original variable TTFs (~1 MB total vs ~3 MB). The four files are roughly 137 KB / 168 KB (Sans italic / roman) and 343 KB / 424 KB (Serif italic / roman).

  ### Why a separate import

  Vite's library mode + Tailwind v4's CSS pipeline inline all `@font-face url()` references as base64 data URLs by default, which would have ballooned the bundled `ratio-ui.css`. Shipping `fonts.css` as a hand-written file outside the Vite bundle keeps the URLs intact, lets the consumer's bundler resolve them as separate cacheable assets, and keeps the main CSS small.

- Updated dependencies [c42ceff]
- Updated dependencies [90b83f5]
- Updated dependencies [9056263]
- Updated dependencies [f193007]
- Updated dependencies [0c33e7e]
- Updated dependencies [b2073e2]
- Updated dependencies [439d1bc]
- Updated dependencies [8d120ff]
- Updated dependencies [23bffe4]
- Updated dependencies [0026040]
- Updated dependencies [811526d]
- Updated dependencies [8c058ec]
- Updated dependencies [212c407]
- Updated dependencies [6b4dc48]
- Updated dependencies [4df1e9b]
- Updated dependencies [67da869]
- Updated dependencies [d2e3286]
- Updated dependencies [9e1c5e9]
- Updated dependencies [18c0976]
- Updated dependencies [2205b54]
- Updated dependencies [38f2ec7]
- Updated dependencies [47dc304]
- Updated dependencies [c403912]
- Updated dependencies [3522c1e]
- Updated dependencies [2382fb5]
- Updated dependencies [5775e95]
- Updated dependencies [2c509b0]
- Updated dependencies [71d4644]
- Updated dependencies [da8ba03]
- Updated dependencies [e941cf7]
- Updated dependencies [59474a4]
- Updated dependencies [294e31f]
- Updated dependencies [5220555]
- Updated dependencies [59fd88b]
- Updated dependencies [d86894a]
- Updated dependencies [a29b507]
  - @eventuras/ratio-ui@2.0.0
  - @eventuras/fides-auth-next@0.1.11
  - @eventuras/ratio-ui-next@0.1.22
  - @eventuras/logger@0.8.1

## 0.1.7

### Patch Changes

- @eventuras/fides-auth-next@0.1.10

## 0.1.6

### Patch Changes

- Updated dependencies [135e60e]
- Updated dependencies [521eb30]
  - @eventuras/ratio-ui@1.3.0
  - @eventuras/ratio-ui-next@0.1.21

## 0.1.5

### Patch Changes

- Updated dependencies [b5de2d6]
- Updated dependencies [6dbc23a]
  - @eventuras/ratio-ui@1.2.0
  - @eventuras/fides-auth-next@0.1.9
  - @eventuras/ratio-ui-next@0.1.20

## 0.1.4

### Patch Changes

- Updated dependencies [839913f]
- Updated dependencies [0ec59ba]
  - @eventuras/ratio-ui@1.1.1
  - @eventuras/ratio-ui-next@0.1.19

## 0.1.3

### Patch Changes

- Updated dependencies [161ee7b]
  - @eventuras/ratio-ui@1.1.0
  - @eventuras/ratio-ui-next@0.1.18

## 0.1.2

### Patch Changes

- Updated dependencies [3543c98]
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/ratio-ui@1.0.4
  - @eventuras/logger@0.8.0
  - @eventuras/ratio-ui-next@0.1.17
  - @eventuras/fides-auth-next@0.1.8

## 0.1.1

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/fides-auth-next@0.1.7
  - @eventuras/logger@0.7.1
  - @eventuras/ratio-ui-next@0.1.16
  - @eventuras/ratio-ui@1.0.3
