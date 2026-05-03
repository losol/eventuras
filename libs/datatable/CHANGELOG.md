# @eventuras/datatable

## 0.5.22

### Patch Changes

- Updated dependencies [2842f02]
  - @eventuras/ratio-ui@2.1.0

## 0.5.21

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

## 0.5.20

### Patch Changes

- Updated dependencies [135e60e]
- Updated dependencies [521eb30]
  - @eventuras/ratio-ui@1.3.0

## 0.5.19

### Patch Changes

- Updated dependencies [b5de2d6]
- Updated dependencies [6dbc23a]
  - @eventuras/ratio-ui@1.2.0

## 0.5.18

### Patch Changes

- Updated dependencies [839913f]
- Updated dependencies [0ec59ba]
  - @eventuras/ratio-ui@1.1.1

## 0.5.17

### Patch Changes

- Updated dependencies [161ee7b]
  - @eventuras/ratio-ui@1.1.0

## 0.5.16

### Patch Changes

- Updated dependencies [3543c98]
  - @eventuras/ratio-ui@1.0.4

## 0.5.15

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/ratio-ui@1.0.3

## 0.5.14

### Patch Changes

- Updated dependencies [e0b00a9]
  - @eventuras/ratio-ui@1.0.2

## 0.5.13

### Patch Changes

- Updated dependencies [e073558]
  - @eventuras/ratio-ui@1.0.1

## 0.5.12

### Patch Changes

- Updated dependencies [abaa171]
- Updated dependencies [202f819]
- Updated dependencies [7b0c54c]
  - @eventuras/ratio-ui@1.0.0

## 0.5.11

### Patch Changes

- Updated dependencies [d5634da]
  - @eventuras/ratio-ui@0.14.1

## 0.5.10

### Patch Changes

- Updated dependencies [bbb9111]
- Updated dependencies [0e1796e]
  - @eventuras/ratio-ui@0.14.0

## 0.5.9

### Patch Changes

- Updated dependencies [0b4b869]
  - @eventuras/ratio-ui@0.13.0

## 0.5.8

### Patch Changes

- Updated dependencies [fce9a48]
- Updated dependencies [cc205db]
- Updated dependencies [21d0d6f]
  - @eventuras/ratio-ui@0.12.0

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
