---
"@eventuras/ratio-ui": patch
---

fix(navbar): apply text color directly on Brand and Content via context

The `bgDark` text color was only set on the parent `<nav>`, relying on
CSS inheritance to reach links inside `Navbar.Brand` and
`Navbar.Content`. This broke when the consumer app ran a separate
Tailwind build (e.g. Ignis with React Router) where ratio-ui's
`--text-light` CSS variable wasn't defined, or when two preflight
layers interfered.

Now the resolved text-color class is passed down via React context and
applied directly on `NavbarBrand` and `NavbarContent`, so links
inside get the correct color regardless of CSS variable availability
or cascade ordering.
