# ThemeToggle Component

UI component for toggling between light and dark mode.

## Usage in Historia

The ThemeToggle is automatically integrated in the header of Historia. It displays a sun icon in dark mode and a moon icon in light mode.

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

// Simple usage with default styling
<ThemeToggle />

// With custom class name
<ThemeToggle className="ml-4" />

// With custom aria-label
<ThemeToggle ariaLabel="Toggle between light and dark theme" />
```

## Implementation Details

The Historia ThemeToggle wraps the base ThemeToggle component from `@eventuras/ratio-ui` and connects it to Historia's theme provider:

- **Base Component**: `@eventuras/ratio-ui/core/ThemeToggle`
- **Historia Wrapper**: `apps/historia/src/components/ThemeToggle/index.tsx`
- **Theme Provider**: Uses `useTheme()` hook from `@/providers/Theme`

## Features

- Displays sun icon (☀️) when in dark mode
- Displays moon icon (🌙) when in light mode
- Automatically syncs with Historia's theme system
- Persists theme preference to localStorage
- Respects system color scheme preference when set to "auto"
- Accessible with proper ARIA labels and screen reader support

## Theme Storage

Theme preference is stored in localStorage with key `payload-theme` and can have values:
- `"light"` - Force light mode
- `"dark"` - Force dark mode
- `null` - Auto (follows system preference)
