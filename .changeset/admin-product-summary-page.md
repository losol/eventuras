---
'@eventuras/web': minor
---

The product summary page — the delivery list for one product on an event — now filters by participation status the way the participant list does: Active, Waiting list and Cancelled as toggles above the table, defaulting to Active. The counts come from the rows themselves rather than the event statistics, so the number on a toggle always describes what the table can show.

It also renders in dark mode again. The page pinned its header section with `bg-white dark:bg-black`, but ratio-ui themes through `[data-theme="dark"]` rather than Tailwind's `dark:` variant, so only the `bg-white` half existed. The section stayed white in every theme while the text used the dark theme's tokens, leaving the product name almost invisible against it.

Two more things that were wrong on the page:

`Edit products` linked to `/admin/events/{id}/products/edit`, a route that does not exist — the editor lives on the event's products tab. The link now goes there.

The column headers and the breadcrumb were hardcoded English on a page that is otherwise translated. They reuse the existing `admin.participantColumns.*` keys, with two new ones for quantity and registration.

Smaller: registration status is a status-coloured badge instead of raw text, matching the filter groups; the last breadcrumb segment uses a theme token instead of a fixed grey, which did not adapt to the theme either; and the totals line is gone, since the counts now sit on the toggles.
