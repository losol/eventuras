# @eventuras/datatable

## 0.5.7

### Patch Changes

- c32e23c: ## DataTable: Bundle optimization

  ### Performance
  - **Bundle size**: Reduced from 100s of KB to 4KB by externalizing React Aria dependencies
    - Externalized: `@eventuras/ratio-ui`, `react-aria-components`, `@react-aria/*`, `@react-stately/*`, `@internationalized/*`
    - Dependencies are now properly treated as peer dependencies instead of being bundled

  ### Features
  - **SearchField integration**: Updated to use new SearchField component from ratio-ui
    - Simpler API: `onChange` receives string directly (no event object)
    - Built-in debouncing

- c32e23c: ## Refactor: Form components and UI improvements

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

- Updated dependencies [c32e23c]
- Updated dependencies [39bd56b]
- Updated dependencies [c32e23c]
  - @eventuras/ratio-ui@0.11.0

## 0.5.6

### Patch Changes

- Updated dependencies [4a6097f]
  - @eventuras/ratio-ui@0.10.1

## 0.5.5

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.10.0

## 0.5.4

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @eventuras/ratio-ui@0.9.0

## 0.5.3

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.2

## 0.5.2

### Patch Changes

- chore: update dependencies across frontend packages
- Updated dependencies
  - @eventuras/ratio-ui@0.8.1

## 0.5.1

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.0

## 0.5.0

### Minor Changes

### 🧱 Features

- feat(datatable): add expandable rows with subcomponent rendering (3bec4e2) [@eventuras/datatable]
- feat(datatable): support custom toolbar (dff5c33) [@eventuras/datatable]
- feat(datatable): build datatable lib with vite (099e0a9) [@eventuras/datatable]

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.7.0

## 0.4.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - feat(datatable): fallback row key (f513c1a)
