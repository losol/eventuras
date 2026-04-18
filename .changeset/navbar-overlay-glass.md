---
"@eventuras/ratio-ui": minor
---

feat(navbar): `overlay`/`glass` props and container-aligned content

Adds two composable props to `<Navbar>`:

- `overlay` — absolute positioning pinned to the viewport top. The navbar
  floats over the next sibling (typically a hero section) without
  reserving layout space and scrolls away with the page. Mutually
  exclusive with `sticky`.
- `glass` — translucent dark background with backdrop-blur, for the
  classic "glass navbar over hero image" look.

Combine with `bgDark` for white text readable over dark hero imagery:

```tsx
<Navbar overlay glass bgDark>
  <Navbar.Brand>…</Navbar.Brand>
  <Navbar.Content className="justify-end">…</Navbar.Content>
</Navbar>
```

The inner content row now also applies the Tailwind `container` class so
brand and navigation align with `<Container>`-wrapped page content
instead of stretching to the viewport edges.

See the `OverlayGlass` story for a live example.

Also safelists a set of commonly-needed layout utilities in ratio-ui's
bundled CSS: spacing (`pt-16…pt-40`, `pb-16…pb-40`, `mt-16…mt-40`,
`mb-16…mb-40`) and hero viewport heights (`min-h-[20vh]` through
`min-h-[80vh]`). Consumers (apps/*) can now use these without setting
up their own Tailwind entry.
