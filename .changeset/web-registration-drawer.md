---
"@eventuras/web": minor
---

feat(web): registration drawer for quick view from admin lists

Admins can now inspect (and edit) a registration without leaving the
current list. A new `RegistrationDrawer` fetches the full
`RegistrationDto` via a `getRegistrationDetail` server action and
renders the existing `<Registration adminMode />` inside a slide-out
panel. Wired into both `/admin/registrations` and the
`/admin/events/[id]` participant list; the drawer footer has a link
to the full detail page where the BusinessEvents timeline still
lives. Deletes unused `AdminRegistrationsList.tsx` dead code.
