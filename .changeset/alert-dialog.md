---
"@eventuras/ratio-ui": minor
---

Add `AlertDialog` for prompts that interrupt the user (confirmations, destructive actions, errors).

API mirrors React Spectrum's `AlertDialog`:

```tsx
<AlertDialog
  isOpen={open}
  onClose={() => setOpen(false)}
  variant="destructive"
  title="Delete event?"
  primaryActionLabel="Delete"
  cancelLabel="Cancel"
  onPrimaryAction={handleDelete}
>
  This will permanently remove the event and all registrations. This cannot be undone.
</AlertDialog>
```

Variants: `'confirmation' | 'information' | 'destructive' | 'error' | 'warning'`. `destructive` and `error` render the primary button in the new `danger` style and auto-focus `Cancel` for safety. `autoFocusButton` overrides the focus heuristic when needed.

Built on top of the compound `Dialog` primitive with `role="alertdialog"` so it picks up the correct ARIA semantics. A new `danger` variant on `Button` ships with this release.
