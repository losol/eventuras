---
'@eventuras/web': patch
---

Fix frontpage 500: split SiteNavbar into server/client halves — ratio-ui 2.14 made Navbar a `use client` module, so its compound statics (`Navbar.Brand`/`Navbar.Content`) are `undefined` when dotted from a server component
