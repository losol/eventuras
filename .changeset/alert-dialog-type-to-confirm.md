---
"@eventuras/ratio-ui": minor
---

Add a type-to-confirm gate to `AlertDialog`. Set `confirmText` and the primary button stays disabled until the user types that exact phrase (whitespace trimmed, case-sensitive). Pair `confirmLabel` with it for a localised instruction.

```tsx
<AlertDialog
  variant="destructive"
  isOpen={open}
  onClose={() => setOpen(false)}
  onPrimaryAction={handleDelete}
  title="Delete event?"
  primaryActionLabel="Delete event"
  cancelLabel="Cancel"
  confirmText="delete"
  confirmLabel='Type "delete" to confirm'
>
  This will permanently remove the event and all registrations.
</AlertDialog>
```

Reserve for irreversible actions where a single misclick is too easy. When `confirmText` is set the input is auto-focused on open (instead of the cancel button), and pressing Enter while the phrase matches triggers the primary action.

Also: the `Input` primitive now forwards `ref` so callers can imperatively focus it.
