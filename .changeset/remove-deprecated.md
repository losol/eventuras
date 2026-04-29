---
"@eventuras/ratio-ui": major
---

Remove deprecated APIs ahead of the 2.0 cut.

**`InputLabel`** — removed. Use `Label` instead. The export was a deprecated re-alias that has lived alongside `Label` since the form-field rewrite.

**`Navbar` legacy shorthand props** — `title`, `titleHref`, and `LinkComponent` are removed. Use the compound `<Navbar.Brand>` slot instead, which lets you pick your own link element (Next `<Link>`, plain `<a>`, etc.) and gives full control over markup and styling:

```tsx
// Before
<Navbar title="My App" titleHref="/" LinkComponent={Link}>
  {children}
</Navbar>

// After
<Navbar>
  <Navbar.Brand>
    <Link href="/" className="text-lg tracking-tight whitespace-nowrap no-underline">
      My App
    </Link>
  </Navbar.Brand>
  <Navbar.Content className="justify-end">{children}</Navbar.Content>
</Navbar>
```

The four internal callsites (`apps/dev-docs`, `apps/idem-admin`, `apps/historia`, ratio-ui's own `Page` story) have been migrated.
