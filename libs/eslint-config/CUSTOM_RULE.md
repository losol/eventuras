# Custom ESLint Rule: `eventuras/no-invalid-testid`

## Overview

Added a custom ESLint rule to enforce correct test ID usage across the codebase.

## Rule Details

The rule `eventuras/no-invalid-testid` ensures that:
- HTML elements use `data-testid` attribute (not `testId` or `data-test-id`)
- React components use `testId` prop
- The old `data-test-id` convention is not used

## Auto-fix Support

This rule includes auto-fix functionality. Run:
```bash
pnpm lint --fix
```

And ESLint will automatically:
- Convert `data-test-id` → `data-testid`
- Convert `testId` → `data-testid` (on HTML elements only)

## Examples

### ❌ Incorrect

```tsx
// Using old convention
<button data-test-id="submit">Submit</button>

// Using testId on HTML element
<div testId="container">Content</div>
```

### ✅ Correct

```tsx
// data-testid on HTML elements
<button data-testid="submit">Submit</button>
<div data-testid="container">Content</div>

// testId on React components
<Button testId="submit">Submit</Button>
<Link testId="home" href="/">Home</Link>
```

## Implementation Files

- `libs/eslint-config/rules/no-invalid-testid.js` - Rule implementation
- `libs/eslint-config/rules/index.js` - Plugin export
- `libs/eslint-config/base.js` - Configuration integration

## Testing

The rule was tested with both positive and negative cases and the auto-fix functionality works correctly.
