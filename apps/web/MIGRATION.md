# Environment Migration Guide

## Quick Migration Script

Use VS Code's Find & Replace (Cmd+Shift+H) with these patterns:

### Step 1: Update all imports

**Find:**
```
import Environment from '@/utils/Environment';
```

**Replace with:**
```
import { publicEnv } from '@/config.client';
```

### Step 2: Replace NEXT_PUBLIC_* usage in client components

**Find (regex enabled):**
```
Environment\.NEXT_PUBLIC_
```

**Replace with:**
```
publicEnv.NEXT_PUBLIC_
```

### Step 3: For SERVER components and API routes, change import

After step 1 & 2, find files that use `appConfig.env` pattern:
- API routes (src/app/api/**/route.ts)
- Server actions (actions.ts files)  
- Server-only utilities

**Manually update these files:**
1. Change import to: `import { appConfig } from '@/config';`
2. Replace `publicEnv.NEXT_PUBLIC_*` with `appConfig.env.NEXT_PUBLIC_*` 
3. For server-only vars like AUTH0_CLIENT_SECRET, use `appConfig.env.AUTH0_CLIENT_SECRET`

### Step 4: Handle Environment.get() calls

**Find (regex):**
```
Environment\.get\(['"](\w+)['"]\)
```

**Replace with:**
```
appConfig.env.$1
```

Then manually update the import to use `appConfig` instead of `publicEnv`.

### Step 5: Handle special cases

#### middleware.ts
```typescript
// OLD:
secure: process.env.NODE_ENV === 'production'

// NEW:
import { appConfig } from '@/config';
secure: appConfig.env.NODE_ENV === 'production'
```

#### oauthConfig.ts (if using Environment.get)
```typescript
// OLD:
import Environment from '@/utils/Environment';
const clientId = Environment.get('AUTH0_CLIENT_ID');

// NEW:
import { appConfig } from '@/config';
const clientId = appConfig.env.AUTH0_CLIENT_ID as string;
```

## File Classification

### Client Components (use `publicEnv`)
These files access `NEXT_PUBLIC_*` vars in browser:
- src/components/**/*.tsx (most)
- src/app/**/page.tsx (if they use NEXT_PUBLIC_*)

### Server Components (use `appConfig.env`)
- src/app/api/**/route.ts
- src/app/**/actions.ts
- src/utils/auth/*.ts
- src/utils/oauthConfig.ts

### Mixed (needs careful review)
- Files that are server components but access NEXT_PUBLIC_* can use either
- Prefer `appConfig.env` for consistency in server code

## Verification

After migration:

```bash
# Type check
pnpm tsc --noEmit

# Build
pnpm build

# Run tests
pnpm test
```

## Delete old file

Once everything works:
```bash
rm src/utils/Environment.ts
```
