---
"@eventuras/ratio-ui": minor
---

Replace legacy `dark:bg-gray-*` / `dark:text-gray-*` Tailwind classes across the forms components with semantic CSS-variable tokens, so dark mode reads warm (Linseed/Linen) instead of cold neutral gray. Also unifies input rounding to `rounded-lg` (8px) per the canonical reference.

```tsx
// Before — cold gray, hardcoded for both themes
'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'

// After — semantic tokens, same classes work on both themes
'bg-card text-(--text) border-border-1'
```

### Token mapping applied

| Legacy | Replacement |
| --- | --- |
| `text-gray-900 dark:text-gray-100` | `text-(--text)` |
| `text-gray-600 dark:text-gray-400` | `text-(--text-muted)` |
| `text-gray-500 dark:text-gray-400` | `text-(--text-subtle)` |
| `text-blue-600 dark:text-blue-400` | `text-(--primary)` |
| `text-red-500 dark:text-red-400` | `text-error-text` |
| `text-green-500 dark:text-green-400` | `text-success-text` |
| `bg-white dark:bg-gray-800` | `bg-card` |
| `bg-gray-50 dark:bg-gray-800` | `bg-card` |
| `bg-gray-100 dark:bg-gray-800` | `bg-card` |
| `border-gray-300 dark:border-gray-600` | `border-border-1` |
| `border-gray-200 dark:border-gray-700` | `border-border-1` |
| `border-gray-300 dark:border-gray-400` | `border-border-2` |
| `hover:bg-gray-100 dark:hover:bg-gray-700` | `hover:bg-card-hover` |
| `focus:ring-blue-500 dark:focus:ring-blue-400` | `focus:ring-(--focus-ring)` |
| `data-[selected]:bg-blue-500 data-[selected]:text-white` | `data-[selected]:bg-(--primary) data-[selected]:text-(--text-on-primary)` |

### Files migrated

`forms/styles/formStyles.ts`, `forms/Input/Input.tsx`, `forms/Input/Checkbox.tsx`, `forms/Input/PhoneInput.tsx`, `forms/Select/Select.tsx`, `forms/RadioGroup/RadioGroup.tsx`, `forms/ListBox/ListBox.tsx`, `forms/NumberField/NumberField.tsx`, `forms/SearchField/SearchField.tsx`.

### Rounded corners

Inputs now use `rounded-lg` (8px) per the canonical reference: `formStyles.defaultInputStyle` previously had no rounding (rendered as a sharp rectangle in `SearchField`); `Input.tsx` and `ListBox` were on `rounded-md`; `NumberField` was a mix of `rounded-md`/`rounded-lg`. All unified.

### Not changed

Two intentional brand-palette tints remain: `Select.tsx` and `formStyles.ts` use `bg-primary-100 dark:bg-primary-800/900` for "selected/focused" list states. No semantic token exists for "tinted-primary" backgrounds, and using `bg-(--primary)` directly would be too saturated for a list item background.
