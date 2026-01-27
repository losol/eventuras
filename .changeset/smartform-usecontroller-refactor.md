---
"@eventuras/smartform": minor
---

## Form Components: Consistent patterns with useController

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
