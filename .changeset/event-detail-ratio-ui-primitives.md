---
'@eventuras/web': patch
---

Adopt the ratio-ui 2.19 detail-page primitives on the public event page: Heading `size` for the editorial serif scale, `DescriptionList` `facts`/`meta` variants for the key-facts strip and registration-card rows, `AsideLayout` for the sticky registration rail (which also fixes the aside being capped at `max-w-sm` on tablets), and `Text` for the lead. Shared `getEventFacts` helper replaces the duplicated date/location/deadline building.
