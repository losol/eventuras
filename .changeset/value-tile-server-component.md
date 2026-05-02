---
"@eventuras/ratio-ui": patch
---

Fix `ValueTile` to work in React Server Components. The compound API used `createContext` / `useContext` to propagate the `orientation` from the root to `ValueTile.Caption`, which forced any page rendering a `ValueTile` to wrap with `'use client'` (or saw a Next.js build error: "createContext only works in Client Components").

Replace the context with a `data-orientation` attribute on the root + named Tailwind `group-orientation-horizontal/value-tile:` variant on the caption — same observable behaviour, no React context, server-component-safe everywhere.
