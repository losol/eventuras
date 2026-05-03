# @eventuras/smartform

## 0.3.15

### Patch Changes

- Updated dependencies [2842f02]
  - @eventuras/ratio-ui@2.1.0

## 0.3.14

### Patch Changes

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

- Updated dependencies [c42ceff]
- Updated dependencies [90b83f5]
- Updated dependencies [9056263]
- Updated dependencies [f193007]
- Updated dependencies [0c33e7e]
- Updated dependencies [b2073e2]
- Updated dependencies [439d1bc]
- Updated dependencies [8d120ff]
- Updated dependencies [23bffe4]
- Updated dependencies [0026040]
- Updated dependencies [811526d]
- Updated dependencies [8c058ec]
- Updated dependencies [212c407]
- Updated dependencies [6b4dc48]
- Updated dependencies [4df1e9b]
- Updated dependencies [67da869]
- Updated dependencies [d2e3286]
- Updated dependencies [9e1c5e9]
- Updated dependencies [18c0976]
- Updated dependencies [2205b54]
- Updated dependencies [38f2ec7]
- Updated dependencies [47dc304]
- Updated dependencies [c403912]
- Updated dependencies [3522c1e]
- Updated dependencies [2382fb5]
- Updated dependencies [5775e95]
- Updated dependencies [2c509b0]
- Updated dependencies [71d4644]
- Updated dependencies [da8ba03]
- Updated dependencies [e941cf7]
- Updated dependencies [59474a4]
- Updated dependencies [294e31f]
- Updated dependencies [5220555]
- Updated dependencies [59fd88b]
- Updated dependencies [d86894a]
- Updated dependencies [a29b507]
  - @eventuras/ratio-ui@2.0.0
  - @eventuras/logger@0.8.1

## 0.3.13

### Patch Changes

- Updated dependencies [135e60e]
- Updated dependencies [521eb30]
  - @eventuras/ratio-ui@1.3.0

## 0.3.12

### Patch Changes

- Updated dependencies [b5de2d6]
- Updated dependencies [6dbc23a]
  - @eventuras/ratio-ui@1.2.0

## 0.3.11

### Patch Changes

- Updated dependencies [839913f]
- Updated dependencies [0ec59ba]
  - @eventuras/ratio-ui@1.1.1

## 0.3.10

### Patch Changes

- Updated dependencies [161ee7b]
  - @eventuras/ratio-ui@1.1.0

## 0.3.9

### Patch Changes

- Updated dependencies [3543c98]
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/ratio-ui@1.0.4
  - @eventuras/logger@0.8.0

## 0.3.8

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/logger@0.7.1
  - @eventuras/ratio-ui@1.0.3

## 0.3.7

### Patch Changes

- Updated dependencies [e0b00a9]
  - @eventuras/ratio-ui@1.0.2

## 0.3.6

### Patch Changes

- Updated dependencies [e073558]
  - @eventuras/ratio-ui@1.0.1

## 0.3.5

### Patch Changes

- Updated dependencies [6e7d2d4]
- Updated dependencies [abaa171]
- Updated dependencies [202f819]
- Updated dependencies [7b0c54c]
  - @eventuras/logger@0.7.0
  - @eventuras/ratio-ui@1.0.0

## 0.3.4

### Patch Changes

- Updated dependencies [d5634da]
  - @eventuras/ratio-ui@0.14.1

## 0.3.3

### Patch Changes

- Updated dependencies [bbb9111]
- Updated dependencies [0e1796e]
  - @eventuras/ratio-ui@0.14.0

## 0.3.2

### Patch Changes

- Updated dependencies [0b4b869]
  - @eventuras/ratio-ui@0.13.0

## 0.3.1

### Patch Changes

- Updated dependencies [fce9a48]
- Updated dependencies [cc205db]
- Updated dependencies [21d0d6f]
  - @eventuras/ratio-ui@0.12.0

## 0.3.0

### Minor Changes

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

- c32e23c: ## Form Components: Consistent patterns with useController

  ### Breaking Changes
  - **TextField**: Refactored to use `useController` instead of `register`
    - Provides direct access to field state (errors, touched, dirty)
    - More consistent with React Hook Form best practices
    - Better TypeScript types

  ### Bug Fixes
  - **React Hooks violations**: Removed all conditional returns before hook calls across all form components
    - Fixed in: TextField, Input, NumberInput, Select, CheckboxInput, HiddenInput
    - All components now follow Rules of Hooks correctly
    - React Hook Form will throw clear errors if used outside FormProvider

  ### Refactoring
  - **Select**: Migrated from `Controller` to `useController` for consistency
    - Changed from `defaultSelectedKey` to `selectedKey` (controlled mode)
  - **PhoneInput**: Migrated from `Controller` to `useController` for consistency

  ### Type Safety
  - **TextField**: Replaced `any` type with proper `HTMLInputElement | null` in ref callbacks

  ### Pattern Improvements

  All smartform components now follow consistent patterns:
  - **Uncontrolled inputs** (Input, NumberInput, CheckboxInput, HiddenInput): Use `register`
  - **Controlled components** (TextField, Select, PhoneInput): Use `useController`
  - All hooks called unconditionally (follows Rules of Hooks)

### Patch Changes

- Updated dependencies [c32e23c]
- Updated dependencies [39bd56b]
- Updated dependencies [c32e23c]
  - @eventuras/ratio-ui@0.11.0

## 0.2.6

### Patch Changes

- Updated dependencies [4a6097f]
  - @eventuras/ratio-ui@0.10.1

## 0.2.5

### Patch Changes

- ### 🧱 Features

  **ratio-ui:**
  - Add new `AutoComplete` component with async loading and client-side filtering capabilities
  - Add new `SearchField` component for search inputs
  - Add new `ListBox` component for accessible list selection
  - Add new `TextField` component as complete form field with label, description, and error handling

  **smartform:**
  - Export new `TextField` component for react-hook-form integration
  - Refactor `Input` component to be a lightweight primitive
  - Update `NumberInput` to use `Label` component instead of `InputLabel`

  **web:**
  - Update multiple admin forms to use new AutoComplete component
  - Migrate forms from Input to TextField where appropriate

  ### 🐞 Bug Fixes

  **ratio-ui:**
  - Enhance AutoComplete with improved selected label handling and filtering logic

  ### ♻️ Refactoring

  **ratio-ui:**
  - Replace Input component with TextField for better separation of concerns
  - Rename `InputLabel` to `Label` for consistency

- Updated dependencies
  - @eventuras/ratio-ui@0.10.0

## 0.2.4

### Patch Changes

- ### 🧱 Features

  **ratio-ui:**
  - Add new `AutoComplete` component with async loading and client-side filtering capabilities
  - Add new `SearchField` component for search inputs
  - Add new `ListBox` component for accessible list selection
  - Add new `TextField` component as complete form field with label, description, and error handling

  **smartform:**
  - Export new `TextField` component for react-hook-form integration
  - Refactor `Input` component to be a lightweight primitive
  - Update `NumberInput` to use `Label` component instead of `InputLabel`

  **web:**
  - Update multiple admin forms to use new AutoComplete component
  - Migrate forms from Input to TextField where appropriate

  ### 🐞 Bug Fixes

  **ratio-ui:**
  - Enhance AutoComplete with improved selected label handling and filtering logic

  ### ♻️ Refactoring

  **ratio-ui:**
  - Replace Input component with TextField for better separation of concerns
  - Rename `InputLabel` to `Label` for consistency

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @eventuras/ratio-ui@0.9.0
  - @eventuras/logger@0.6.0

## 0.2.3

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.2

## 0.2.2

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.1

## 0.2.1

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.0

## 0.2.0

### Minor Changes

### 🧱 Features

- feat(smartform): bundle as library (7352d1b) [@eventuras/smartform]

### 🧹 Maintenance

- chore(smartform): mark deps as external (aff4a8c) [@eventuras/smartform]

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @eventuras/logger@0.5.0
  - @eventuras/ratio-ui@0.7.0
