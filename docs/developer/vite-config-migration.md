# Vite Config Centralization - Migration Guide

This document outlines the migration from individual Vite configs to the centralized `@eventuras/vite-config` library.

## Status

✅ **Created**: `libs/vite-config` package with three presets
✅ **Migrated**: `libs/sdk` (example migration completed successfully)
⏳ **Pending**: 4 more libraries need migration

## Libraries to Migrate

### 1. ✅ libs/sdk (COMPLETED)
- **Preset**: `vanilla-lib`
- **Migration**: Simple vanilla TypeScript library
- **Build verified**: ✅ Success

### 2. libs/markdown
- **Current config**: React + Tailwind + DTS with module preservation
- **Recommended preset**: `react-lib`
- **Special needs**: Tailwind CSS, module preservation, external markdown-to-jsx

### 3. libs/ratio-ui
- **Current config**: React + Tailwind + glob entries + 'use client' preservation
- **Recommended preset**: `react-lib`
- **Special needs**: Glob pattern entries, Tailwind, custom 'use client' plugin

### 4. libs/ratio-ui-next
- **Current config**: React + multiple named entries + Next.js externals
- **Recommended preset**: `next-lib`
- **Special needs**: Multiple entry points, Next.js compatibility

### 5. libs/scribo
- **Current config**: React SWC + conditional build (lib vs site)
- **Recommended preset**: `react-lib` with `useSWC: true`
- **Special needs**: BUILD_SITE environment variable handling (keep custom logic)

## Migration Steps (General)

For each library:

1. **Add dependency** to `package.json`:
   ```json
   "devDependencies": {
     "@eventuras/vite-config": "workspace:*"
   }
   ```

2. **Remove now-unnecessary dependencies**:
   - `vite-plugin-dts` (included in vite-config)
   - `@vitejs/plugin-react` (for React libs, included in vite-config)
   - `@vitejs/plugin-react-swc` (if using SWC, included in vite-config)
   - `@tailwindcss/vite` (if using Tailwind, included in vite-config)
   - Keep `vite` itself as devDependency

3. **Replace vite.config.ts** with appropriate preset

4. **Run build** to verify: `pnpm exec vite build`

5. **Commit changes** following conventional commits

## Example Migrations

### Example 1: Simple Vanilla Library (libs/sdk) ✅

**Before:**
```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EventurasSDK',
      fileName: 'eventuras',
    },
  },
});
```

**After:**
```typescript
import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

export default defineVanillaLibConfig({
  entry: 'src/index.ts',
  name: 'EventurasSDK',
});
```

**Result**: 15 lines → 5 lines (67% reduction)

### Example 2: React Library with Tailwind (libs/markdown)

**Before:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      copyDtsFiles: true,
      rollupTypes: false
    })
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'markdown-to-jsx', '@eventuras/ratio-ui', /^@eventuras\/ratio-ui\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js'
      }
    }
  }
});
```

**After:**
```typescript
import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  tailwind: true,
  external: ['markdown-to-jsx', '@eventuras/ratio-ui', /^@eventuras\/ratio-ui\//],
});
```

**Result**: 42 lines → 7 lines (83% reduction)

### Example 3: Next.js Compatible Library (libs/ratio-ui-next)

**Before:**
```typescript
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'Image/index': resolve(__dirname, 'src/Image/index.ts'),
        'Link/index': resolve(__dirname, 'src/Link/index.ts'),
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'next', 'next/image', 'next/link', '@eventuras/ratio-ui'],
      output: {
        preserveModules: false,
      },
    },
  },
});
```

**After:**
```typescript
import { defineNextLibConfig } from '@eventuras/vite-config/next-lib';
import { resolve } from 'path';

export default defineNextLibConfig({
  entry: {
    'Image/index': resolve(__dirname, 'src/Image/index.ts'),
    'Link/index': resolve(__dirname, 'src/Link/index.ts'),
    index: resolve(__dirname, 'src/index.ts'),
  },
  external: ['@eventuras/ratio-ui'],
  preserveModules: false,
});
```

**Result**: 29 lines → 11 lines (62% reduction)

## Benefits Realized

1. **Code Reduction**: 60-85% reduction in config file size
2. **Consistency**: All libraries use same build patterns
3. **Maintainability**: Update once in `libs/vite-config`, benefit everywhere
4. **Type Safety**: Full TypeScript support for config options
5. **Documentation**: Centralized docs in vite-config README
6. **Best Practices**: Enforced defaults (sourcemaps, module formats, etc.)

## Next Steps

1. ✅ Create `libs/vite-config` package
2. ✅ Migrate `libs/sdk` as proof of concept
3. ⏳ Migrate `libs/markdown`
4. ⏳ Migrate `libs/ratio-ui`
5. ⏳ Migrate `libs/ratio-ui-next`
6. ⏳ Migrate `libs/scribo` (handle BUILD_SITE conditional)
7. 📝 Update CONTRIBUTING.md to reference vite-config for new libraries
8. 📝 Consider adding to `.github/copilot-instructions.md`

## Rollback Plan

If issues arise, each library can revert to its previous config by:
1. Restoring original `vite.config.ts` from git
2. Restoring original `package.json` dependencies
3. Running `pnpm install`

## Questions & Considerations

- **Q**: Should we bundle vite-plugin-dts versions across all libs?
  **A**: Yes, managed in vite-config ensures consistency

- **Q**: What about libraries with unique build needs?
  **A**: Use `viteConfig` option to merge custom config

- **Q**: How to handle future Vite major version updates?
  **A**: Update once in vite-config, test all libs, deploy together

## Related Files

- Implementation: `libs/vite-config/`
- Example migration: `libs/sdk/vite.config.ts`
- Documentation: `libs/vite-config/README.md`
- Changelog: `libs/vite-config/CHANGELOG.md`
