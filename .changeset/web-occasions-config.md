---
'@eventuras/web': minor
---

Site settings can carry an `occasions` block — days the site marks (mourning, Pride, Christmas, New Year, Constitution Day) as a dated override and a yearly schedule. The block is validated entry by entry (invalid entries are logged and dropped), resolved per request in the site's time zone, and the active occasion is exposed as `data-occasion` on `<html>`, with ratio-ui's `data-motion="none"` switch set during mourning. Theming follows ratio-ui's two axes: an occasion or the site can set a named palette (`theme` → `data-theme`, e.g. `bureau`, `ink`) and/or force a colour scheme (`colorScheme` → `data-color-scheme`), rendered server-side with the theme toggle hidden while forced. The light/dark toggle itself now writes `data-color-scheme` instead of the legacy `data-theme="dark"` — the consumer step of ratio-ui's theme migration; stored preferences carry over. No visual changes yet: occasion styling and announcements follow in ratio-ui.
