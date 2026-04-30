---
"@eventuras/ratio-ui": major
---

Migrate `Drawer` to React Aria Components' `ModalOverlay`/`Modal`/`Dialog` stack and drop the now-orphaned `Portal` primitive.

### Drawer

The hand-rolled overlay (custom `<Portal>` + manual `id="backdrop"` + leaking `addEventListener` without cleanup + no focus management) is replaced with RAC's high-level primitives. Visual output is unchanged. The drawer now ships with:

- **Focus trap** — Tab cycles within the drawer.
- **Focus restoration** — focus returns to the trigger when the drawer closes.
- **Scroll lock** — body no longer scrolls under the open drawer.
- **Structured dismissal controls** — new `isDismissable` and `isKeyboardDismissDisabled` props with sensible defaults (true/false).

#### Breaking change: `onSave` prop removed

`Drawer` previously accepted an `onSave?: () => void` prop, but it was never wired to anything inside the component (no save button rendered, no callback invoked). It was effectively dead code. The single internal caller (`OrderActionsMenu`) passed it as a duplicate of `onCancel` — fixed up in the same migration.

If you have a save button inside your drawer, render it yourself in `<Drawer.Footer>` as you would any other action.

#### New `Drawer.Heading` subcomponent

`<Drawer.Heading>` renders a `<Heading slot="title">` so the drawer's accessible name is auto-wired via `aria-labelledby`. This is the recommended way to title a drawer:

```tsx
<Drawer isOpen={open} onCancel={close}>
  <Drawer.Header>
    <Drawer.Heading>Edit user</Drawer.Heading>
  </Drawer.Header>
  <Drawer.Body>...</Drawer.Body>
  <Drawer.Footer>...</Drawer.Footer>
</Drawer>
```

`Drawer.Header` is unchanged — it remains the layout slot at the top of the drawer (where you put the heading, breadcrumbs, action buttons, etc.). Existing drawers without `Drawer.Heading` still render correctly but will emit an RAC a11y warning until migrated.

### Portal removed

`@eventuras/ratio-ui/layout/Portal` had a single internal caller (`Drawer`), which no longer needs it. The component was a thin wrapper around `ReactDOM.createPortal` with a leaking event-listener pattern; consumers who need raw portal behavior should use `react-dom`'s `createPortal` directly.
