---
"@eventuras/ratio-ui": major
---

Refactor `Footer` to a thin shell + `Footer.Classic` backward-compat wrapper.

`Footer` is now a shell that renders the standard `<footer>` element with bg, padding, and a `Container` — anything goes inside. The pre-2.0 fixed layout (siteTitle + publisher block on the left, children on the right via `md:flex`) lives on as `Footer.Classic` for callers that want it.

```tsx
// Before
<Footer siteTitle={site.name} publisher={site.publisher}>
  <List>...</List>
</Footer>

// After (no behavior change — just renamed)
<Footer.Classic siteTitle={site.name} publisher={site.publisher}>
  <List>...</List>
</Footer.Classic>

// New: shell mode for fully custom layouts
<Footer dark>
  <YourCustomFooterContent />
</Footer>
```

This is a structural change — no UI difference for existing call sites — that opens up the `Footer` namespace for additive subcomponents (`Footer.Brand`, `Footer.Content`, `Footer.Publisher`, …) in a future minor release. We didn't ship them now to avoid locking in a design before a real layout need surfaces.

The four `apps/web` layouts, `apps/historia`'s Footer, and the ratio-ui Page story have all been migrated to `Footer.Classic` (mechanical rename, no behavior change).
