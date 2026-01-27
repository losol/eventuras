---
"@eventuras/ratio-ui": minor
"@eventuras/smartform": minor
"@eventuras/datatable": patch
---

## Refactor: Form components and UI improvements

### Breaking Changes
- **TextField**: Now uses `useController` instead of `register` for better field state access
  - Provides direct access to field errors and validation state
  - More consistent with React Hook Form best practices

### Bug Fixes
- **Label component**: Fixed critical bug where children were not rendered inside `<AriaLabel>` tags
- **SearchField**: Removed duplicate clear button by relying on React Aria's built-in clear functionality
- **React Hooks violations**: Removed all conditional returns before hook calls in form components (TextField, Input, NumberInput, Select, CheckboxInput, HiddenInput)
- **UserLookup**: Fixed Popover positioning error by adding explicit `triggerRef` prop

### Features
- **SearchField component** (ratio-ui): New component with built-in 300ms debouncing, search icon, and dark mode support
- **ToggleButtonGroup**: Added dark mode styling and fixed border rendering with z-index layering
- **Form consistency**: Refactored Select and PhoneInput to use `useController` for consistent patterns across controlled components

### Pattern Improvements
All smartform components now follow consistent patterns:
- **Uncontrolled inputs** (Input, NumberInput, CheckboxInput, HiddenInput): Use `register`
- **Controlled components** (TextField, Select, PhoneInput): Use `useController`
