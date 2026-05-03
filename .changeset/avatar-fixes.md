---
"@eventuras/ratio-ui": patch
---

Address review feedback on `Avatar`:

- **Falls back to initials on image load failure** — instead of leaving the browser's default broken-image indicator over the badge, `Avatar` now hides the `<img>` when `onError` fires and reveals the initials underneath. Tracks the failed URL so swapping `src` to a new value re-shows the image without resetting state via an effect.
- **Initials-only avatars are now labelled** — when no `src` is provided, the wrapper still gets `role="img"` + `aria-label={name}`, so an avatar-only button or link is announced with the user's full name instead of just the visible initials (e.g. "ll").
- **Initials text uses the semantic `--text` token** — replaces the hardcoded `text-primary-800 dark:text-primary-200` so the avatar adapts to consumers that swap the text color independently of the primary scale.
- **Storybook no longer makes a real failing network request** — the broken-image story uses an invalid `data:` URL so the failure is synchronous and offline; renamed to `FallsBackToInitialsOnError` to reflect the new behaviour.
