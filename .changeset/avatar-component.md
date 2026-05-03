---
"@eventuras/ratio-ui": minor
---

Add `Avatar` — circular user-avatar component with serif italic initials over a primary-tinted radial gradient. Pass `src` to render a profile image; the browser handles the load. The component does not silently fall back to the initials on broken images — pass URLs you've already verified, or skip `src` and rely on the initials.

```tsx
<Avatar name="Leo Losen" />                  // initials "ll" auto-derived
<Avatar name="Ola" initials="o" size="sm" /> // manual override + small
<Avatar name="Ada Lovelace" src="/me.jpg" size="lg" /> // image + lg
```

Three sizes — `sm` (30px) for navbar trigger pills, `md` (40px) default, `lg` (44px) for the identity header inside user-menu dropdowns. Initials auto-derive from `name` (first letter of first + last word, lowercased; first two letters for a single-word name) with a manual `initials` override for edge cases.

The radial gradient uses different primary-mix percentages per theme (25/12 in light, 10/4 in dark) so the avatar reads as lighter against a light page and noticeably darker against the dark surface. Initial text uses `text-primary-800 dark:text-primary-200` for strong contrast in either mode.

When `src` is set the wrapper carries `role="img"` plus an accessible name from `name` (or the new `ariaLabel` override) so screen readers announce something meaningful even if the image element itself ends up empty.
