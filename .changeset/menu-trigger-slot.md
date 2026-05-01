---
"@eventuras/ratio-ui": major
---

**Breaking:** Replace the `Menu` `menuLabel: string` prop with a `Menu.Trigger` compound subcomponent. The previous API forced a single hardcoded pill-shaped trigger; the new slot lets consumers compose any content (avatar + name, icon-only, custom layouts) and override styling via `className`.

```tsx
// Before
<Menu menuLabel={user.name}>
  <Menu.Link href="/profile">Profile</Menu.Link>
</Menu>

// After
<Menu>
  <Menu.Trigger>
    {user.name}
    <Menu.Chevron />
  </Menu.Trigger>
  <Menu.Link href="/profile">Profile</Menu.Link>
</Menu>
```

`Menu.Trigger` keeps the previous default styling (rounded-full primary pill) so flat string migrations stay visually identical — the chevron now ships as `Menu.Chevron` so consumers building avatar/icon triggers can omit it.

This is the only structural change to `Menu` in this release. Future additions (`Menu.Header`, `Menu.Section`, item icon/badge slots, danger variant) will be additive and ship in a later release without further breaking changes.
