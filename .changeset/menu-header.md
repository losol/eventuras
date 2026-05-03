---
"@eventuras/ratio-ui": minor
---

Add `Menu.Header` (beta) — identity block for the top of a user-menu dropdown. Composes a leading node (typically `<Avatar>`) with three meta slots — `Menu.Header.Name`, `Menu.Header.Email`, `Menu.Header.Role` — over a primary-tinted background separated from the menu items by a hairline border.

```tsx
import { Avatar } from '@eventuras/ratio-ui/core/Avatar';

<Menu>
  <Menu.Trigger>...</Menu.Trigger>
  <Menu.Header>
    <Avatar name="Leo Losen" size="lg" />
    <Menu.Header.Name>Leo Losen</Menu.Header.Name>
    <Menu.Header.Email>leo@losen.com</Menu.Header.Email>
    <Menu.Header.Role>Admin</Menu.Header.Role>
  </Menu.Header>
  <Menu.Link href="/user">My profile</Menu.Link>
  <Menu.Button id="logout" onClick={...}>Log out</Menu.Button>
</Menu>
```

The component walks its children and groups the meta slots into a flex column to the right of any non-meta children, so consumers write the natural reading order without wrapping the meta column themselves.

Marked `@beta` in JSDoc — the prop shape, slot contract, and visual treatment may evolve before release. Additive only: existing `Menu` callers are unaffected.
