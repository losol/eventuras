---
"@eventuras/ratio-ui": minor
---

## UI Components: Form improvements and new SearchField

### Bug Fixes
- **Label component**: Fixed critical bug where children were not rendered inside `<AriaLabel>` tags, causing labels to appear empty

### Features
- **SearchField component**: New search input with built-in 300ms debouncing, search icon, and clear button
  - Dark mode support
  - Configurable debounce delay
  - forwardRef support
  - Uses formStyles.defaultInputStyle for consistency
- **ToggleButtonGroup**: Added dark mode styling with proper border rendering using z-index layering

### Improvements
- **SearchField stories**: Updated to demonstrate new debouncing API
- **AutoComplete**: Exports raw React Aria SearchField for composable patterns
- Removed DebouncedInput export (replaced by SearchField with built-in debouncing)
