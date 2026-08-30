---
'@eventuras/web': patch
'@eventuras/smartform': patch
---

Adopt ratio-ui 2.22: the event detail page uses ratio-ui's `SectionNav` (with its `useActiveSection` scroll-spy) instead of a local copy, sticky offsets are CSS lengths on `AsideLayout.Aside` and `--scroll-margin-top` instead of px approximations and inline scroll margins, and the site navbar names its landmark (`aria-label`) so a page with a section nav has two named `<nav>`s. Also picks up `@eventuras/ratio-ui-next` 1.0.1 (same API — the major marks the package stable and adds its licence and provenance) and `@eventuras/markdown` 0.15.1.
