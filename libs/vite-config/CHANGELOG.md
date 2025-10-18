# @eventuras/vite-config

## 0.1.0 (2025-10-18)

### Major Changes

- Initial release of centralized Vite configuration presets
- Added `defineVanillaLibConfig` for vanilla TypeScript libraries
- Added `defineReactLibConfig` for React component libraries
- Added `defineNextLibConfig` for Next.js-compatible libraries

### Features

- TypeScript declaration generation with vite-plugin-dts
- Optional Tailwind CSS support
- 'use client' directive preservation for React Server Components
- Configurable module preservation
- Support for multiple entry points via glob patterns
- Automatic exclusion of test files and stories from type generation
- Choice between Babel and SWC for React transformation
