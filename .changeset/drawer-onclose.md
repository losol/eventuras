---
"@eventuras/ratio-ui": major
---

Rename `Drawer`/`FileDrawer` `onCancel` prop to `onClose` for consistency with `Dialog` and `AlertDialog`.

```tsx
// Before
<Drawer isOpen={open} onCancel={close}>...</Drawer>
<FileDrawer isOpen={open} onCancel={close} ... />

// After
<Drawer isOpen={open} onClose={close}>...</Drawer>
<FileDrawer isOpen={open} onClose={close} ... />
```

`AlertDialog`'s `onCancel` is intentionally kept — it represents a distinct user action ("clicked Cancel") separate from `onClose` ("dialog dismissed for any reason"). On `Drawer`/`FileDrawer` the two semantics were always conflated, so the rename loses no information.

All internal callsites in `apps/web` and `apps/historia` have been migrated.
