---
"@eventuras/ratio-ui": minor
"@eventuras/web": patch
---

feat(ratio-ui): Dialog size prop; refactor(web): widen + clean ProductModal

**ratio-ui**: `<Dialog>` takes a new `size` prop (`sm | md | lg | xl`)
mapped to `max-w-md | max-w-lg | max-w-2xl | max-w-4xl` on the panel
(28 / 32 / 42 / 56 rem). Default is `md` (~32rem). Callers that need
the previous narrower width can opt in with `size="sm"`.

**web**: `ProductModal` now uses `size="lg"` for a more usable editing
width, lays the three numeric fields (price / vat / min quantity) in a
3-column grid on ≥sm viewports, and drops dead code: an unused
`useForm`/`reset` pair that never drove the smartform-backed form, and
the `<ConfirmDiscardModal>` wiring whose `setConfirmDiscardChanges`
was never invoked. Also deletes the now-orphaned
`ConfirmDiscardModal.tsx`.
