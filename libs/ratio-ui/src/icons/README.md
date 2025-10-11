# Icons Module

This module provides a centralized export of all icons used in the Eventuras design system.

## Purpose

- **Centralized Management**: All icons used in ratio-ui and consuming apps are exported from this single location
- **Future Extensibility**: Custom icons can be added alongside lucide-react icons
- **Consistent Usage**: Ensures all apps use the same icon set from the design system
- **Type Safety**: Full TypeScript support for all exported icons

## Usage

Import icons from this module instead of directly from lucide-react:

```tsx
import { Calendar, User, Check } from '@eventuras/ratio-ui/icons';

function MyComponent() {
  return (
    <div>
      <Calendar className="h-5 w-5" />
      <User size={20} />
      <Check />
    </div>
  );
}
```

## Adding New Icons

To add a new icon to the design system:

1. **Find the icon** in lucide-react: https://lucide.dev/icons
2. **Add it to the export** in `index.ts`:
   ```tsx
   export {
     // ... existing icons
     ArrowRight,  // Add your new icon here
   } from 'lucide-react';
   ```
3. **Group it appropriately** (Navigation, Status, Actions, etc.)
4. **Use it** in your components via `@eventuras/ratio-ui/icons`

## Custom Icons

In the future, custom icons can be added to this directory:

```tsx
// Custom icon implementation
export function CustomEventIcon(props: IconProps) {
  return <svg {...props}>...</svg>;
}

// Export alongside lucide icons
export { CustomEventIcon } from './custom/CustomEventIcon';
```

## Currently Exported Icons

See the main `index.ts` file for the complete list of exported icons, organized by category:

- **Navigation & UI Controls**: ChevronDown, ChevronUp, X, etc.
- **Status & Feedback**: Check, AlertCircle, Info, etc.
- **Actions & Content**: Eye, Pencil, Trash2, User, etc.
- **Loading & System**: LoaderCircle
