# @eventuras/core Library Setup Summary

## What Was Done

Successfully created a new vanilla TypeScript library `@eventuras/core` with regex validation patterns moved from `apps/web`.

## Structure Created

```
libs/core/
├── src/
│   ├── index.ts                 # Main entry point
│   └── regex/
│       └── index.ts             # Regex patterns
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── README.md
└── CHANGELOG.md
```

## Files Created

### Core Files
- **libs/core/package.json** - Package configuration with exports for main and regex subpath
- **libs/core/tsconfig.json** - TypeScript configuration extending react-library config
- **libs/core/vite.config.ts** - Vite build configuration with multiple entry points
- **libs/core/eslint.config.js** - ESLint configuration

### Source Files
- **libs/core/src/index.ts** - Main library entry point, re-exports regex module
- **libs/core/src/regex/index.ts** - Regex patterns with full documentation

### Documentation
- **libs/core/README.md** - Usage guide and examples
- **libs/core/CHANGELOG.md** - Version history

## Regex Patterns Moved

From `apps/web/src/app/admin/users/UserEditor.tsx`:

1. `internationalPhoneNumber` - E.164 international phone number format
2. `letters` - Unicode letters only
3. `lettersAndSpace` - Unicode letters and spaces
4. `lettersSpaceAndHyphen` - Unicode letters, spaces, and hyphens

## Usage

### Import Options

```typescript
// Import all regex patterns
import { regex } from '@eventuras/core';

// Or import from subpath
import * as regex from '@eventuras/core/regex';

// Or import specific patterns
import { internationalPhoneNumber, lettersSpaceAndHyphen } from '@eventuras/core/regex';
```

### Example

```typescript
// Before (in apps/web)
const regex = {
  internationalPhoneNumber: /^\+[1-9]{1}[0-9]{1,14}$/,
  // ...
};

// After (using the library)
import * as regex from '@eventuras/core/regex';

const isValid = regex.internationalPhoneNumber.test('+4712345678');
```

## Files Updated

- **apps/web/package.json** - Added `@eventuras/core` dependency
- **apps/web/src/app/admin/users/UserEditor.tsx** - Removed local regex definitions, imported from `@eventuras/core/regex`

## Build Configuration

The library uses:
- **Vite** for building with multiple entry points
- **TypeScript** with strict mode
- **Multiple exports** in package.json for tree-shaking support
- **ESM only** (type: "module")

## Benefits

1. **Reusability** - Regex patterns can now be used across all apps
2. **Maintainability** - Single source of truth for validation patterns
3. **Documentation** - All patterns have TSDoc comments
4. **Type Safety** - Full TypeScript support with generated .d.ts files
5. **Tree-shaking** - Subpath exports allow importing only what's needed

## Next Steps

Consider adding:
- Unit tests for regex patterns
- Additional common validation patterns (email, URL, etc.)
- Utility functions that use these patterns
- More core utilities (date formatting, string manipulation, etc.)
