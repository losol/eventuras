---
"@eventuras/ratio-ui": major
---

Refactor `Dialog` to a compound API.

The `title` prop is removed. Use `<Dialog.Heading>` instead, and the new `<Dialog.Content>` / `<Dialog.Footer>` slots when you need structured layout.

**Before:**

```tsx
<Dialog isOpen={open} onClose={close} title="Edit product">
  <Form>{/* … */}</Form>
  <div className="flex gap-2">
    <Button type="submit">Save</Button>
    <Button variant="secondary" onClick={close}>Cancel</Button>
  </div>
</Dialog>
```

**After:**

```tsx
<Dialog isOpen={open} onClose={close}>
  <Dialog.Heading>Edit product</Dialog.Heading>
  <Dialog.Content>
    <Form>{/* … */}</Form>
  </Dialog.Content>
  <Dialog.Footer>
    <Button variant="secondary" onClick={close}>Cancel</Button>
    <Button type="submit">Save</Button>
  </Dialog.Footer>
</Dialog>
```

Also adds an optional `role` prop (`'dialog' | 'alertdialog'`) so prompts that interrupt the user can opt into the correct ARIA role. A higher-level `AlertDialog` wrapper that builds on this primitive will follow in a separate release.
