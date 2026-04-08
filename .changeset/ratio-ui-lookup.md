---
"@eventuras/ratio-ui": minor
---

### Add `Lookup` component for async typeahead pickers

New `Lookup<T>` component in `core/Lookup/`, exposed as
`@eventuras/ratio-ui/core/Lookup`. Generic, inline typeahead picker for
"search asynchronously, navigate results with the keyboard, pick one to
trigger an action" flows — the pattern that was previously duplicated
between `UserLookup` and `EventLookup` in `apps/web`.

```tsx
<Lookup<UserDto>
  label="Search User"
  placeholder="Search by name or email (min 3 characters)"
  minChars={3}
  load={searchUsers}
  getItemKey={u => u.id!}
  getItemLabel={u => u.name ?? ''}
  getItemTextValue={u => `${u.name} ${u.email}`}
  renderItem={u => (
    <>
      <div className="font-medium">{u.name}</div>
      <div className="text-sm text-gray-600">{u.email}</div>
    </>
  )}
  onItemSelected={u => setSelected(u)}
  emptyState="No users found"
/>
```

Built on `react-aria`'s `Autocomplete` + `ListBox` + `useAsyncList`. Handles
loading spinner, min-char threshold, re-query dedup after selection, and
empty/placeholder states internally. Placed in `core/` next to
`CommandPalette` because it is a standalone interactive widget — not a form
control — and is used to trigger actions rather than collect form values.
