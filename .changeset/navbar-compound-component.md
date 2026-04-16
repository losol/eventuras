---
"@eventuras/ratio-ui": minor
---

feat(navbar): compound component API with `Navbar.Brand` and `Navbar.Content`

The Navbar now supports a compound-component pattern for full control
over brand, navigation, and action zones:

```tsx
<Navbar sticky>
  <Navbar.Brand>
    <Link to="/"><Logo /> Ignis</Link>
  </Navbar.Brand>
  <Navbar.Content>
    <NavLink to="/events">Events</NavLink>
    <div className="ml-auto flex gap-2">
      <SearchField />
      <UserMenu />
    </div>
  </Navbar.Content>
</Navbar>
```

`Navbar.Brand` is optional — admin bars and secondary navbars can use
just `Navbar.Content`. Stacking two `<Navbar>` gives a double-navbar
layout with no additional API.

The previous `title` / `titleHref` / `LinkComponent` props still work
for backward compatibility but are deprecated in favour of
`Navbar.Brand`.
