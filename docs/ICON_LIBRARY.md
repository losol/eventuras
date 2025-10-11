# Icon Library Guidelines

## Standard Icon Library

**Eventuras uses [lucide-react](https://lucide.dev/) as the standard icon library across the monorepo.**

### Why lucide-react?

- ✅ **Consistent Design**: Stroke-based icons with uniform styling
- ✅ **Tree-shakeable**: Only imports icons you use
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Active Maintenance**: Regular updates and new icons
- ✅ **React-first**: Built specifically for React applications
- ✅ **Performance**: Better bundle size optimization vs alternatives
- ✅ **Rich Icon Set**: 1400+ icons covering all common use cases

### Installation

lucide-react is already installed in the following packages:

- `apps/web`
- `apps/historia`
- `libs/ratio-ui`
- `libs/smartform`

For new packages, add it as a dependency:

```bash
npm install lucide-react
```

### Usage

Import icons from lucide-react:

```tsx
import { Calendar, MapPin, User, Settings } from 'lucide-react';

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

### Migration from @tabler/icons-react

If you're migrating from @tabler/icons-react, here's the mapping:

| Tabler Icon | Lucide Icon | Notes |
|------------|-------------|-------|
| IconCheck | Check | Direct replacement |
| IconX | X | Direct replacement |
| IconCircleX | CircleX | Direct replacement |
| IconUser | User | Direct replacement |
| IconTrash | Trash2 | Use Trash2 for consistency |
| IconEye | Eye | Direct replacement |
| IconPencil | Pencil | Direct replacement |
| IconNotes | FileText | Notes → FileText |
| IconShoppingCart | ShoppingCart | Direct replacement |
| IconChevronsLeft | ChevronsLeft | Direct replacement |
| IconChevronsRight | ChevronsRight | Direct replacement |
| IconChevronDown | ChevronDown | Direct replacement |

### Replacing Inline SVG Icons

Instead of inline SVG code, use lucide-react icons:

**❌ Before (Inline SVG):**
```tsx
<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293..." />
</svg>
```

**✅ After (lucide-react):**
```tsx
import { ChevronDown } from 'lucide-react';

<ChevronDown className="h-5 w-5" />
```

### Finding Icons

Browse all available icons at: https://lucide.dev/icons

Search by:
- Name (e.g., "calendar", "user")
- Category (e.g., "arrows", "files", "communication")
- Tags (e.g., "time", "person", "document")

### Out of Scope

**CSS-embedded SVG icons in `libs/scribo`** (Markdown editor) are not migrated as part of this standardization. These are considered part of the editor's internal styling and can be migrated separately if needed.

### Best Practices

1. **Import only what you need** to keep bundle size small:
   ```tsx
   // ✅ Good
   import { Calendar } from 'lucide-react';
   
   // ❌ Bad
   import * as Icons from 'lucide-react';
   ```

2. **Use consistent sizing** across your application:
   ```tsx
   // Define common sizes
   const iconSizes = {
     sm: 16,
     md: 20,
     lg: 24,
   };
   ```

3. **Apply accessibility** attributes when needed:
   ```tsx
   <Settings aria-label="Open settings" role="img" />
   ```

4. **Style with Tailwind** classes for consistency:
   ```tsx
   <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
   ```

### Contributing

When adding new features that require icons:

1. ✅ **Always use lucide-react**
2. ❌ **Do not add new icon libraries**
3. ❌ **Do not use inline SVG for icons** (unless absolutely necessary)
4. 📝 **Document any special icon usage** in your PR

If you can't find an appropriate icon in lucide-react, discuss alternatives with the team before adding a new dependency.
