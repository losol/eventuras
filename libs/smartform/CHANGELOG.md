# @eventuras/smartform

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
