---
"@eventuras/ratio-ui": patch
---

Fix `Strip` to work in React Server Components. The initial implementation used `createContext` / `useContext` to propagate the borderless state to slot children, which forced consumers to wrap any page rendering a `Strip` with `'use client'` (or saw a Next.js build error: "You're importing a module that depends on `createContext` into a React Server Component module").

Replace the context with a `data-borderless` attribute on the strip root and named Tailwind group-data variants on the slots — same behaviour, no React context, server-component-safe everywhere.
