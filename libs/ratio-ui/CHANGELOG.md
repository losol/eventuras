# @eventuras/ratio-ui

## 1.0.4

### Patch Changes

- 3543c98: fix(card): use `border-border-1` token for the default variant's border
  so custom `border` and `borderColor` props override cleanly in both
  light and dark mode. The previous hardcoded `border-gray-200/50` +
  `dark:border-gray-700/50` meant dark mode kept the gray color even when
  the consumer supplied a colored border.
- Updated dependencies [7d2b896]
- Updated dependencies [fc1f5dc]
  - @eventuras/logger@0.8.0

## 1.0.3

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/logger@0.7.1

## 1.0.2

### Patch Changes

- e0b00a9: Minor layout refreshments: subtle border and shadow on default Card, improved category group spacing

## 1.0.1

### Patch Changes

- e073558: Rename component exports that shadow built-in globals (Error → ErrorBlock/FieldError, Number → NumberField), remove identical sub-expressions in Link, and fix duplicate CSS properties with missing font fallback

## 1.0.0

### Major Changes

- abaa171: ### Unified spacing, border, color, and status APIs (ADR-0001)

  Major prop cleanup across ratio-ui in preparation for 1.0. The goal:
  typed semantic props instead of raw Tailwind strings, a single shared
  `Status` vocabulary across all status-bearing components, and consistent
  HTML attribute forwarding.

  #### New shared types and utilities
  - `Space` — 6-step semantic spacing scale (`'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`),
    backed by fluid CSS tokens
  - `SpacingProps` — `padding`, `paddingX`, `paddingY`, `paddingTop`, `paddingBottom`,
    `margin`, `marginX`, `marginY`, `marginTop`, `marginBottom`, `gap` — all typed as `Space`
  - `BorderProps` — typed `border`, `borderColor`, `radius` props
  - `Color` — full semantic palette (`neutral`, `primary`, `secondary`, `accent`,
    `success`, `warning`, `error`, `info`)
  - `Status` — status subset (`neutral`, `success`, `warning`, `error`, `info`)
  - `buildSpacingClasses(props)` and `buildBorderClasses(props)` — typed mappers
    exported from `@eventuras/ratio-ui/tokens`
  - `cn(...inputs)` — `clsx` + `tailwind-merge`, exported from
    `@eventuras/ratio-ui/utils`
  - `buildCoverImageStyle(url, style?, overlay?)` — exported from
    `@eventuras/ratio-ui/utils`

  #### Tailwind v4 theme extension

  `tokens/spacing.css` now registers `--spacing-xs` through `--spacing-xl` so
  that `p-xs`, `gap-md`, `m-lg` etc. work as standard Tailwind utilities.

  #### Component changes

  Component props migrated from raw Tailwind strings to the new typed APIs:
  - **Box** — uses `SpacingProps` + `BorderProps`. `BoxSpacingProps`,
    `BoxBackgroundProps`, `BoxContentProps`, and the old `buildSpacingClasses`
    are removed. `getBackgroundStyle` is renamed to `buildCoverImageStyle` and
    moved to `utils/`.
  - **Stack** — `gap` uses the shared `Space` type. The `'2xl'` value is removed.
  - **Container** — uses `SpacingProps` + forwards HTML attrs.
  - **Section** — single Section component at `layout/Section`. The old
    `core/Section` is removed. `container`, `grid`, `backgroundColorClass`,
    `backgroundImageUrl`, and `backgroundImageOverlay` props removed; consumers
    use `<Container>` wrapping, `className`, and `style={buildCoverImageStyle(...)}`
    directly. New typed `color?: Color` prop for surface colors.
  - **Card** — uses `SpacingProps` + `BorderProps`. `dark`, `container`, `grid`,
    and `backgroundColorClass` props removed. New typed `color?: Color` prop.
    `Card.css` removed; surface tokens live in `tokens/theme.css` (`--card`,
    `--card-hover`).
  - **Button** — default `margin="m-1"` removed (parents control spacing).
    `padding`, `margin`, `border`, `width`, `height` props removed.
  - **ButtonGroup** — uses `SpacingProps` + forwards HTML attrs.
  - **Heading**, **Text**, **Lead**, **Link** — use `SpacingProps`. `border`,
    `width`, `height` props removed.
  - **Text**, **Lead** — `text`/`children` props are now a discriminated union;
    passing both is a compile-time error instead of a runtime throw.
  - **Story**, **StoryHeader**, **StoryBody**, **StoryFooter** — use
    `SpacingProps` + forward HTML attrs.
  - **Panel** — `intent` prop renamed to `status`, uses shared `Status` type.
    `Panel.css` removed; classes mapped via Tailwind Records using design tokens.
  - **Badge** — `variant` renamed to `status`. `'positive'`/`'negative'` removed
    in favor of `'success'`/`'error'`. `'warning'` added. Uses shared `Status`.
  - **Toast** — old `core/Toast` component removed. See the separate toast
    changeset: the toast system is rewritten on top of React Aria and now lives
    at `@eventuras/ratio-ui/toast` (replacing the standalone `@eventuras/toast`
    package).
  - **PageOverlay** — `variant` renamed to `status`. `'default'` becomes
    `'neutral'`. Uses shared `Status`.
  - **Error block** — `tone` renamed to `status`. Uses shared `Status`.
  - **ErrorPage** — `tone` renamed to `status`. `'fatal'` renamed to `'error'`.
    Uses shared `Status`.
  - **DescriptionList** — now a compound component. Use
    `<DescriptionList.Item>`, `<DescriptionList.Term>`,
    `<DescriptionList.Definition>`, or the new `<DescriptionList.Description term="...">`
    shortcut. The standalone `Item`, `Term`, `Definition` exports are removed.
  - **Dialog** — `DialogModal` and `DialogModalProps` are no longer exported
    (internal implementation detail).

  #### Other cleanups
  - All `default exports` replaced with named exports (~25 components). Menu
    retains `Object.assign` compound pattern.
  - `gridGapClasses` and `getGridClasses` removed (no consumers).
  - `tailwind-merge` added as a dependency.
  - New `testId` prop on Container, Section, Card, Heading, ButtonGroup, and
    Story blocks for consistency with other components.
  - New export paths: `@eventuras/ratio-ui/tokens` and `@eventuras/ratio-ui/utils`.

  #### Migration

  For most consumers, the migration is mechanical:

  ```tsx
  // Before
  <Heading as="h2" padding="pb-3">Title</Heading>
  <Section padding="py-8" backgroundColorClass="bg-gray-50 dark:bg-gray-900">
  <Badge variant="positive">Active</Badge>
  <Panel variant="alert" intent="error">Error</Panel>

  // After
  <Heading as="h2" paddingBottom="xs">Title</Heading>
  <Section paddingY="lg" color="neutral">
  <Badge status="success">Active</Badge>
  <Panel variant="alert" status="error">Error</Panel>
  ```

  For unusual spacing values that don't map to the semantic scale, use
  `className` as the escape hatch.

- 7b0c54c: Add accessible toast system at `@eventuras/ratio-ui/toast`, replacing the standalone `@eventuras/toast` package.

  ## Why

  The previous `@eventuras/toast` package was a custom XState machine rendering plain `<div>`s. It lacked landmark navigation, focus management, pause-on-hover, and proper screen reader announcements. We've rewritten it on top of [React Aria's toast primitives](https://react-aria.adobe.com/react-aria/Toast.html) and folded the package into ratio-ui so all UI lives in one place.

  ## What changed
  - **New export path**: `@eventuras/ratio-ui/toast`. The standalone `@eventuras/toast` package has been removed.
  - **Accessibility**: toast region is now a landmark (navigate with F6 / Shift+F6), focus is managed on close, timers pause on hover/focus, screen readers announce content correctly.
  - **Animations**: toasts slide in/out via CSS animations targeting react-aria's `data-entering` / `data-exiting` attributes.
  - **No provider required**: `ToastsContext` is removed. Toast state lives in a singleton `toastQueue`. Just render `<ToastRenderer />` once at the app root.
  - **Dependencies**: `xstate`, `@xstate/react`, and `uuid` are no longer needed for toasts.

  ## Public API

  The `useToast()` hook signature is unchanged:

  ```ts
  toast.success(message, options?): string
  toast.error(message, options?): string
  toast.warning(message, options?): string
  toast.info(message, options?): string
  toast.remove(key): void
  ```

  Each method returns a string `key` that can be passed to `toast.remove()` for programmatic dismissal.

  ## Migration

  ```diff
  - import { useToast } from '@eventuras/toast';
  + import { useToast } from '@eventuras/ratio-ui/toast';

  - import { ToastRenderer, ToastsContext } from '@eventuras/toast';
  + import { ToastRenderer } from '@eventuras/ratio-ui/toast';
  ```

  Providers that wrapped children in `<ToastsContext.Provider>` must drop the wrapper:

  ```diff
  - <ToastsContext.Provider>
  -   <ToastRenderer />
  -   {children}
  - </ToastsContext.Provider>
  + <ToastRenderer />
  + {children}
  ```

  Remove `@eventuras/toast` from your app's `package.json` dependencies.

### Minor Changes

- 202f819: ### Add `Lookup` component for async typeahead pickers

  New `Lookup<T>` component in `core/Lookup/`, exposed as
  `@eventuras/ratio-ui/core/Lookup`. Generic, inline typeahead picker for
  "search asynchronously, navigate results with the keyboard, pick one to
  trigger an action" flows — the pattern that was previously duplicated
  between `UserLookup` and `EventLookup` in `apps/web`.

  ```tsx
  <Lookup<UserDto>
    label="Search User"
    placeholder="Search by name or email (min 3 characters)"
    minChars={3}
    load={searchUsers}
    getItemKey={(u) => u.id!}
    getItemLabel={(u) => u.name ?? ""}
    getItemTextValue={(u) => `${u.name} ${u.email}`}
    renderItem={(u) => (
      <>
        <div className="font-medium">{u.name}</div>
        <div className="text-sm text-gray-600">{u.email}</div>
      </>
    )}
    onItemSelected={(u) => setSelected(u)}
    emptyState="No users found"
  />
  ```

  Built on `react-aria`'s `Autocomplete` + `ListBox` + `useAsyncList`. Handles
  loading spinner, min-char threshold, re-query dedup after selection, and
  empty/placeholder states internally. Placed in `core/` next to
  `CommandPalette` because it is a standalone interactive widget — not a form
  control — and is used to trigger actions rather than collect form values.

### Patch Changes

- Updated dependencies [6e7d2d4]
  - @eventuras/logger@0.7.0

## 0.14.1

### Patch Changes

- d5634da: Remove default `margin="m-1"` from Button component to follow spacing principle where parents control spacing between children.

## 0.14.0

### Minor Changes

- bbb9111: ### ratio-ui
  - Add `ActionBar` layout component for grouping page-level actions

  ### Web
  - Add "Preview certificate" button that opens certificate HTML preview in a new tab
  - Refactor event editor tabs to use `ActionBar` for save and certificate actions

- 0e1796e: ### Menu
  - Rounded corners, softer dividers, and stable border on dropdown menu
  - Add `Menu.ThemeToggle` compound component with Sun/Moon icons from lucide-react
  - Export `Sun` and `Moon` icons from ratio-ui

  ### Web
  - Add dark/light theme toggle to user menu
  - Use translated strings for logout label (was hardcoded)
  - Add `lightTheme` / `darkTheme` translation keys (nb-NO, en-US)

## 0.13.0

### Minor Changes

- 0b4b869: feat(ratio-ui): Add ProgressRing and ProgressBar components with shared animation hook, semantic color tokens, Storybook stories, and MDX documentation.

## 0.12.0

### Minor Changes

- fce9a48: ### 🧱 Features
  - feat(ratio-ui): add TreeView, TableOfContents, and ThreeColumnLayout components (897252d) [@eventuras/ratio-ui]

- cc205db: ### 🧱 Features
  - feat(ratio-ui): add Schedule and ScheduleItem components with styles (8a1c65d) [@eventuras/ratio-ui]

  ♻️ Refactoring
  - refactor(ratio-ui): update eslint configuration to use flat config format (d4e68fa) [@eventuras/ratio-ui]

  ### 🧹 Maintenance
  - chore(ratio-ui): better heading layout (68ccaac) [@eventuras/ratio-ui]
  - chore(ratio-ui): update quote layout (a76df51) [@eventuras/ratio-ui]

- 21d0d6f: ### 🧱 Features
  - feat(ratio-ui): implement CommandPalette component with keyboard shortcuts and search (c0b761a) [@eventuras/ratio-ui]
  - feat(ratio-ui): enhance Select component with testing capabilities and improved styles (1162681) [@eventuras/ratio-ui]

  ### 🐞 Bug Fixes
  - fix(ratio-ui): auto-expand items when currentPath changes (a0853d3) [@eventuras/ratio-ui]
  - fix(ratio-ui): enhance focus management with focus trap and aria attributes (2ce2054) [@eventuras/ratio-ui]
  - fix(ratio-ui): remove redundant position property from body styles (c074ffe) [@eventuras/ratio-ui]

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
