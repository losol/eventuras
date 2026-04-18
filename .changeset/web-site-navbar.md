---
"@eventuras/web": patch
---

refactor: extract `SiteNavbar` and migrate layouts to compound Navbar API

Consolidates four duplicated navbar blocks across `(public)`, `(user)`,
`(admin)`, and `(frontpage)` into a single async server component with
a `variant` prop (`primary` | `transparent` | `dark`), optional `title`
override, and internal `UserMenu` wiring. Uses ratio-ui's compound
`<Navbar.Brand>` + `<Navbar.Content>` slots.

The frontpage's dark variant now uses ratio-ui's new `overlay` + `glass`
props to float above the hero image.

UserMenu translation keys on the frontpage are standardised to the
`common.labels.*` set already used by the other three layouts. Net
visible change: the landing-page user menu now reads "Mine kurs"
instead of "Dine kurs" for consistency.
