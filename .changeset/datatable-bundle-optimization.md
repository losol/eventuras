---
"@eventuras/datatable": patch
---

## DataTable: Bundle optimization

### Performance
- **Bundle size**: Reduced from 100s of KB to 4KB by externalizing React Aria dependencies
  - Externalized: `@eventuras/ratio-ui`, `react-aria-components`, `@react-aria/*`, `@react-stately/*`, `@internationalized/*`
  - Dependencies are now properly treated as peer dependencies instead of being bundled

### Features
- **SearchField integration**: Updated to use new SearchField component from ratio-ui
  - Simpler API: `onChange` receives string directly (no event object)
  - Built-in debouncing
