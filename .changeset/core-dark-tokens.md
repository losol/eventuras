---
"@eventuras/ratio-ui": minor
---

Final dark-mode token sweep — replace remaining legacy `dark:bg-gray-*` / `dark:text-gray-*` Tailwind classes across core, layout, blocks, and visuals components with semantic CSS-variable tokens. Forms (#1381) and commerce (#1382) covered the rest. Now all dark-mode in `@eventuras/ratio-ui` reads warm (Linseed/Linen) instead of cold neutral gray.

```tsx
// Before
'text-gray-900 dark:text-white' / 'bg-white dark:bg-gray-800' / 'border-gray-200 dark:border-gray-700'

// After
'text-(--text)' / 'bg-card' / 'border-border-1'
```

### Touched (34 files)

`Badge`, `Breadcrumbs`, `Button`, `CommandPalette`, `DescriptionList`, `Footer`, `Image`, `Kbd`, `Link`, `List`, `Lookup`, `Menu`, `Navbar`, `NavList`, `ObfuscatedEmail`, `PageOverlay`, `ProductCard`, `Schedule`, `SplitButton`, `Stepper`, `Table`, `TableOfContents`, `Tabs`, `Timeline`, `ToggleButton`, `ToggleButtonGroup`, `TreeView`, `ActionBar`, `Dialog`, `Drawer`, `Stack`, `Error`, `SessionWarning`, `ProgressBar`.

### Notable refactors

- **`Button` variants** rewritten to use semantic tokens: `primary` → `bg-(--primary) text-(--text-on-primary)`, `secondary` → `bg-card border-border-1 text-(--text)`, `outline` → `border-border-2 hover:border-(--primary)`, `danger` → `bg-error text-error-on`. The `light` variant keeps `primary-100/dark:primary-800` brand tints.
- **`Stepper` status colors** mapped to status palette: `bg-green-500 dark:bg-green-600` → `bg-success-500`, `bg-red-500 dark:bg-red-600` → `bg-error-500`, `bg-primary-600 dark:bg-primary-500` → `bg-(--primary)`. Connector "upcoming" → `bg-(--border-2)`.
- **Inputs and popovers** rounded to `rounded-lg` (8px) per the canonical 8px reference. Lookup input bumped from `rounded-md` to `rounded-lg`.
- **`Badge`/`PageOverlay`** removed redundant `dark:` duplicates that hardcoded the same value.
- **Glass overlays** in `Footer`, `Navbar` (when `glass`), and `ActionBar` now route through the existing `--overlay-hover/press/drag` tokens (`bg-overlay-hover/press/drag`) instead of hardcoded `bg-black/X dark:bg-white/X` patterns. Visual: ActionBar near-identical (5%→4-6%); Footer slightly subtler in light (10%→8%); Navbar glass tint reduced in light (20%→12%) and slightly stronger in dark (10%→16%) — now consistent with the system convention that dark surfaces benefit from a more visible overlay.

### Remaining `dark:` (intentional)

After this sweep, ~17 `dark:` occurrences remain. All are intentional brand/status/neutral palette tints: `bg-primary-100 dark:bg-primary-800` for selected/focused list states, `ring-primary-200 dark:ring-primary-800` for Stepper rings, `bg-neutral-50 dark:bg-neutral-900` in `tokens/colors.ts` `surfaceBgClasses`. These differ in shade per theme by design and don't bypass the token system.
