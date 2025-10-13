# Icon Library Guidelines

## Standard Icon Library

**Eventuras uses [lucide-react](https://lucide.dev/) as the standard icon library across the monorepo.**

All icons are re-exported from `@eventuras/ratio-ui/icons` to provide a centralized place for icon management in the design system.

### Why lucide-react?

- ✅ **Consistent Design**: Stroke-based icons with uniform styling
- ✅ **Tree-shakeable**: Only imports icons you use
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Active Maintenance**: Regular updates and new icons
- ✅ **React-first**: Built specifically for React applications
- ✅ **Performance**: Better bundle size optimization vs alternatives
- ✅ **Rich Icon Set**: 1400+ icons covering all common use cases

### Installation

The icon library is available through `@eventuras/ratio-ui` which already includes `lucide-react` as a dependency.

For packages using ratio-ui, icons are available through the `/icons` export:

```bash
# ratio-ui is already installed in most packages
npm install @eventuras/ratio-ui
```

### Usage

**Recommended**: Import icons from the ratio-ui design system:

```tsx
import { Calendar, MapPin, User, Settings } from '@eventuras/ratio-ui/icons';

function MyComponent() {
  return (
    <div>
      <Calendar className="h-5 w-5" />
      <MapPin size={16} />
      <User className="w-6 h-6" strokeWidth={2} />
      <Settings size={20} color="blue" />
    </div>
  );
}
```

**Alternative** (for icons not yet exported from ratio-ui):

```tsx
import { ArrowRight } from 'lucide-react';
```

> **Note**: When using an icon not yet exported from `@eventuras/ratio-ui/icons`, please add it to `libs/ratio-ui/src/icons/index.ts` for future use.

### Common Icon Props

All lucide-react icons accept the following props:

- `size`: number - Icon size (sets both width and height)
- `color`: string - Icon color
- `strokeWidth`: number - Stroke width (default: 2)
- `className`: string - CSS classes
- Standard SVG attributes (width, height, etc.)

### Icon Naming Convention

lucide-react uses PascalCase naming:

- **Good**: `Check`, `ChevronDown`, `AlertCircle`
- **Bad**: `check`, `chevron-down`, `alert-circle`

### Available Icons in ratio-ui

The following icons are currently exported from `@eventuras/ratio-ui/icons`:

**Navigation & UI Controls:**
- ChevronDown, ChevronUp, ChevronLeft, ChevronRight
- ChevronsLeft, ChevronsRight
- MoreHorizontal, X

**Status & Feedback:**
- Check, CircleX
- AlertCircle, AlertTriangle, Info
- ShieldX

**Actions & Content:**
- Eye, Pencil, Trash2
- User, FileText, ShoppingCart
- Calendar, MapPin, Home

**Loading & System:**
- LoaderCircle

> To add more icons, update `libs/ratio-ui/src/icons/index.ts`

### Migration from @tabler/icons-react

If you're migrating from @tabler/icons-react, here's the mapping:

| Tabler Icon | Lucide Icon | Available in ratio-ui/icons |
|------------|-------------|----------------------------|
| IconCheck | Check | ✅ |
| IconX | X | ✅ |
| IconCircleX | CircleX | ✅ |
| IconUser | User | ✅ |
| IconTrash | Trash2 | ✅ |
| IconEye | Eye | ✅ |
| IconPencil | Pencil | ✅ |
| IconNotes | FileText | ✅ |
| IconShoppingCart | ShoppingCart | ✅ |
| IconChevronsLeft | ChevronsLeft | ✅ |
| IconChevronsRight | ChevronsRight | ✅ |
| IconChevronDown | ChevronDown | ✅ |

### Replacing Inline SVG Icons

Instead of inline SVG code, use icons from the design system:

**❌ Before (Inline SVG):**
```tsx
<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293..." />
</svg>
```

**✅ After (ratio-ui icons):**
```tsx
import { ChevronDown } from '@eventuras/ratio-ui/icons';

<ChevronDown className="h-5 w-5" />
```

### Adding New Icons to the Design System

When you need an icon not yet exported from `@eventuras/ratio-ui/icons`:

1. **Check if it exists** in lucide-react: https://lucide.dev/icons
2. **Add it to the design system** in `libs/ratio-ui/src/icons/index.ts`:
   ```tsx
   export {
     // ... existing icons
     ArrowRight,  // Add your icon here
   } from 'lucide-react';
   ```
3. **Use it** in your component:
   ```tsx
   import { ArrowRight } from '@eventuras/ratio-ui/icons';
   ```

This approach ensures:
- All icons used in the design system are centralized
- Future custom icons can be added alongside lucide icons
- Consistent icon usage across all apps

### Finding Icons

Browse all available icons at: https://lucide.dev/icons

Search by:
- Name (e.g., "calendar", "user")
- Category (e.g., "arrows", "files", "communication")
- Tags (e.g., "time", "person", "document")

### Out of Scope

**CSS-embedded SVG icons in `libs/scribo`** (Markdown editor) are not migrated as part of this standardization. These are considered part of the editor's internal styling and can be migrated separately if needed.

### Best Practices

1. **Use the design system exports** for consistency:
   ```tsx
   // ✅ Good - uses design system
   import { Calendar } from '@eventuras/ratio-ui/icons';
   
   // ⚠️ Acceptable - for icons not yet in design system
   import { Smartphone } from 'lucide-react';
   
   // ❌ Bad - bypasses design system
   import * as Icons from 'lucide-react';
   ```

2. **Add new icons to the design system** when using them:
   - Update `libs/ratio-ui/src/icons/index.ts`
   - This makes them available for all apps

3. **Use consistent sizing** across your application:
   ```tsx
   // Define common sizes
   const iconSizes = {
     sm: 16,
     md: 20,
     lg: 24,
   };
   ```

4. **Apply accessibility** attributes when needed:
   ```tsx
   <Settings aria-label="Open settings" role="img" />
   ```

5. **Style with Tailwind** classes for consistency:
   ```tsx
   <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
   ```

### Contributing

When adding new features that require icons:

1. ✅ **First choice: Use icons from `@eventuras/ratio-ui/icons`**
2. ✅ **Second choice: Import from lucide-react and add to ratio-ui/icons**
3. ❌ **Do not add new icon libraries**
4. ❌ **Do not use inline SVG for icons** (unless absolutely necessary)
5. 📝 **Document any special icon usage** in your PR

**Adding a new icon to the design system:**
1. Check it exists in lucide-react: https://lucide.dev/icons
2. Add to `libs/ratio-ui/src/icons/index.ts`
3. Submit PR with the icon addition

If you can't find an appropriate icon in lucide-react, discuss alternatives with the team before adding a new dependency.
