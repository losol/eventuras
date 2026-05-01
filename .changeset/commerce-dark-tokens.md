---
"@eventuras/ratio-ui": patch
---

Replace legacy `dark:bg-gray-*` / `dark:text-gray-*` Tailwind classes in the commerce components (`CartLineItem`, `OrderSummary`) with semantic CSS-variable tokens, so dark mode reads warm (Linseed/Linen) instead of cold neutral gray.

```tsx
// Before
'text-gray-900 dark:text-white' / 'text-gray-500 dark:text-gray-400' / 'border-gray-200 dark:border-gray-700'

// After
'text-(--text)' / 'text-(--text-subtle)' / 'border-border-1'
```

The "Fjern" remove button moves from `text-red-600 dark:text-red-400` to `text-error-text hover:opacity-80`.

Second sweep in the dark-mode token migration; forms went out in a previous PR. Core components and blocks still pending.
