---
"@eventuras/ratio-ui": minor
---

Migrate `Dialog` to React Aria Components' full `ModalOverlay` / `Modal` / `Dialog` stack.

The previous custom overlay (low-level `@react-aria/overlays` + custom backdrop `<div>` + manual click-outside via `e.target === e.currentTarget` + manual Escape handling) is replaced with RAC's high-level primitives. Visual output is unchanged, but the dialog now ships with proper a11y/UX semantics that were previously missing:

- **Focus trap** — Tab cycles within the dialog and can no longer escape to elements behind the overlay.
- **Focus restoration** — focus returns to the trigger element when the dialog closes.
- **Scroll lock** — the body no longer scrolls underneath the open dialog.
- **Click outside / Escape** are now handled by RAC, with structured `isDismissable` and `isKeyboardDismissDisabled` controls instead of always-on hardcoded behavior.
- **Portal handling** is built in (no more direct dependency on `@react-aria/overlays`'s `Overlay`).

### New props

```tsx
<Dialog
  isOpen={open}
  onClose={close}
  isDismissable={false}            // backdrop click no longer closes
  isKeyboardDismissDisabled        // Escape no longer closes
>
  <Dialog.Heading>Confirm something important</Dialog.Heading>
  <Dialog.Content>...</Dialog.Content>
  <Dialog.Footer>...</Dialog.Footer>
</Dialog>
```

Both new props default to RAC's defaults (`isDismissable: true`, `isKeyboardDismissDisabled: false`), so existing call sites get no behavior change beyond the a11y/UX wins above.

`AlertDialog` automatically inherits these improvements since it composes `Dialog` internally.
