---
"@eventuras/ratio-ui": minor
---

Add a `dark` boolean prop to `Section`, `Container`, `Navbar`, and `Footer` for declaring a dark-toned surface concisely.

Builds on the surface-token system: instead of writing `className="surface-dark"` by hand, callers pass the boolean and the component applies the class. The className remains the right tool for non-container elements and for the rare `surface-light` opt-in case.

```tsx
// Before — className still valid
<Section className="surface-dark" style={heroBg}>...</Section>
<Navbar className="surface-dark" overlay glass>...</Navbar>

// After — concise prop
<Section dark style={heroBg}>...</Section>
<Navbar dark overlay glass>...</Navbar>
```

Internal callsites in `apps/web` and `apps/idem-admin` migrated to use the prop.
