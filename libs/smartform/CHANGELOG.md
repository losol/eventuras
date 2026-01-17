# @eventuras/smartform

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
