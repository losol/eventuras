# @eventuras/ratio-ui

## 0.11.0

### Minor Changes

- c32e23c: ## UI Components: Form improvements and new SearchField

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

- 39bd56b: Add Panel component for alerts, callouts, and notices

  **New Component:**
  - **Panel**: Versatile container component for displaying contextual messages
    - Three variants: `alert`, `callout`, `notice`
    - Five intents: `info`, `success`, `warning`, `error`, `neutral`
    - Automatic ARIA `role="alert"` for alert variant
    - Dark mode support
    - Customizable via className prop

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

## 0.10.1

### Patch Changes

- 4a6097f: Enhanced dark mode support across UI components.

## 0.10.0

### Minor Changes

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

## 0.9.0

### Minor Changes

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

- ### 🧱 Features
  - Add `CartLineItem` and `OrderSummary` components for e-commerce functionality
  - Add `Stack` component for flexible layout
  - Add `Breadcrumbs` component for navigation
  - Add `Story` components with two-column layout support
  - Add `ThemeToggle` component for dark mode switching
  - Add `NumberField` component integration
  - Enhance `Image` component with improved handling and grid layout support
  - Update theme configuration with mode toggle decorator

  ### 🐞 Bug Fixes
  - Add missing colors to theme
  - Correct prose handling in `RichText` component
  - Decrease width of `NumberField` for better UI consistency

  ### ♻️ Refactoring
  - Restructure CSS imports and add new styling options
  - Code cleanup and organization improvements

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.6.0

## 0.8.2

### Patch Changes

- chore: update deps

## 0.8.1

### Patch Changes

- chore: update dependencies across frontend packages

## 0.8.0

### Minor Changes

- ### 🧱 Features
  - feat(ratio-ui): adds new splitButton (4f50613) [@eventuras/ratio-ui]

## 0.7.0

### Minor Changes

### 🧱 Features

- feat(ratio-ui): add radiogroup (2e0013c) [@eventuras/ratio-ui]
- feat(ratio-ui): add togglebutton (13ec24a) [@eventuras/ratio-ui]
- feat(ratio-ui): eventuras icons from lucide (fa5e901) [@eventuras/ratio-ui]
- feat(ratio-ui): enhance error reporting components (53cb7b2) [@eventuras/ratio-ui]
- feat(ratio-ui): add Stepper component (d528a71) [@eventuras/ratio-ui]
- feat(web,ratio-ui): implement error handling components and overlays for better user feedback (b18c222) [@eventuras/ratio-ui]

### 🐞 Bug Fixes

- fix(ratio-ui): align react versions (1ef8329) [@eventuras/ratio-ui]
- fix(ratio-ui): add @vitejs/plugin-react dependency (f92a19e) [@eventuras/ratio-ui]
- fix(ratio-ui): testid naming fix (8935a38) [@eventuras/ratio-ui]
- fix(ratio-ui): testId for phoneInput (d3b2e83) [@eventuras/ratio-ui]
- fix(ratio-ui): specify client only comonents (5048023) [@eventuras/ratio-ui]

### ♻️ Refactoring

- refactor(ratio-ui): move next components to separate lib (7839941) [@eventuras/ratio-ui]
- refactor(web,ratio-ui): streamline imports and enhance type definitions across components (9a64a93) [@eventuras/ratio-ui]
- refactor(ratio-ui): enhance exports (379c72f) [@eventuras/ratio-ui]

### 🧹 Maintenance

- chore(ratio-ui): add some more stories (088166b) [@eventuras/ratio-ui]
- chore(ratio-ui): integrate Vitest with Storybook and add accessibility testing support (157d6ed) [@eventuras/ratio-ui]

### Patch Changes

- Updated dependencies
  - @eventuras/logger@0.5.0

## 0.6.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - feat(ratio-ui): implement ErrorPage component with customizable tones and fullscreen support (e5a4ae0)
  - feat(ratio-ui): new Image component (14b5498)
  - feat(ratio-ui): phone input component with country selector (d738c68)
  - chore(ratio-ui): upgrade to storybook v9 (df6ce57)
  - feat(ratio-ui): implement new Menu component and user session handling (#931) (4fa3081)
  - feat(ratio): add storybook theming (2917436)
  - feat(ratio): new navlist component (58910ec)
  - feat(ratio): update navbar with stories (49cef11)
  - feat(ratio): adds some more stories (0c430b6)
  - ci(ratio): adds storybook ci (d7b36d9)
  - chore(ui): move Footer and Navbar to ui lib (5f9616c)
  - refactor(ui): refactor Card imports (191a722)
  - feat(ui): section component and box refactored (52fb7b0)
  - feat(ui): update button styles (#910) (b7a7e17)
  - feat(ui): add storybook themes (f9cff12)
  - feat(ui): adds storybook again to ratio ui (90d67b8)
  - refactor(ui): new folder structure (2931ffc)
  - refactor(ui): rename ui library to ratio-ui (2a3b25d)
  - chore(ui): upgrade to tailwind v4 (ec91676)
  - feat(ui): add multiline text input (fef28b0)
