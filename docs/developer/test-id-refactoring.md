# Test ID Refactoring

## Summary

This document describes the refactoring of test ID attributes across the Eventuras monorepo to improve developer experience.

## Problem

Previously, developers had to use an awkward syntax to set test IDs on components:

```tsx
<Button {...{ [DATA_TEST_ID]: 'my-button' }}>Click me</Button>
```

This required:
- Importing `DATA_TEST_ID` constant from `@eventuras/utils`
- Using computed property syntax with spread operators
- Poor readability and DX

## Solution

The refactoring standardized test IDs across the monorepo:

### React Components (in `libs/ratio-ui`)

All React components now accept a `testId` prop:

```tsx
<Button testId="my-button">Click me</Button>
<Input testId="email-input" name="email" />
<Form testId="login-form">...</Form>
```

### HTML Elements

For plain HTML elements, use `data-testid` directly:

```tsx
<div data-testid="container">...</div>
<button data-testid="submit-button">Submit</button>
```

### Playwright Tests

All Playwright tests now use the standard `data-testid` selector:

```ts
await page.locator('[data-testid="login-button"]').click();
```

## Changes Made

### 1. Updated All React Components in `libs/ratio-ui`

- Button
- Input (and all input variants)
- Form
- Dialog
- Menu (Link and Button variants)
- Link
- Text
- Tabs
- DescriptionList (Definition component)
- Toast

Each component now:
- Accepts `testId?: string` prop
- Renders `data-testid={testId}` attribute on the root element
- Removed dependency on `DATA_TEST_ID` constant

### 2. Updated All Application Code

- Replaced all instances of `{...{ [DATA_TEST_ID]: 'value' }}` with `testId="value"`
- Removed all imports of `DATA_TEST_ID` from `@eventuras/utils`
- Updated `libs/smartform` components to use the same pattern

### 3. Updated Playwright Tests

- Changed all selectors from `[data-test-id="..."]` to `[data-testid="..."]`
- This aligns with React Testing Library and other standard testing tools

### 4. Removed Constants

- Deleted `libs/utils/src/constants.ts`
- Deleted `apps/web/src/utils/constants.ts`
- Updated exports in `libs/utils/src/index.ts`

## Migration Guide

If you're working on existing code:

### Before:
```tsx
import { DATA_TEST_ID } from '@eventuras/utils';

<Button {...{ [DATA_TEST_ID]: 'submit-button' }}>
  Submit
</Button>
```

### After:
```tsx
<Button testId="submit-button">
  Submit
</Button>
```

## Benefits

1. **Better DX**: Simple, readable prop syntax
2. **Standard**: Aligns with React Testing Library conventions
3. **Type-safe**: TypeScript autocomplete for `testId` prop
4. **Consistent**: Same pattern across all components
5. **Cleaner**: No need to import constants

## Testing

The standard `data-testid` attribute is now used consistently:

- **React Testing Library**: `getByTestId('my-element')`
- **Playwright**: `page.locator('[data-testid="my-element"]')`
- **Cypress**: `cy.get('[data-testid="my-element"]')`

## Script

A migration script is available at `scripts/fix-test-ids.sh` that can automatically update legacy code patterns.
