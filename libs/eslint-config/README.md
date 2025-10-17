# `@eventuras/eslint-config`

Collection of internal eslint configurations.

## Custom Rules

### `eventuras/no-invalid-testid`

Enforces the correct usage of test IDs on HTML elements.

**Rule:** HTML elements must use `data-testid` attribute, not `data-test-id` or `testId`.

**Why:**

- `testId` is a prop for React components (like `<Button testId="..." />`)
- `data-testid` is the standard HTML attribute for testing
- `data-test-id` is the old convention we're moving away from

**Examples:**

❌ **Incorrect:**

```tsx
// Wrong: using data-test-id (old convention)
<button data-test-id="submit-button">Submit</button>

// Wrong: using testId on HTML element
<div testId="container">Content</div>
```

✅ **Correct:**

```tsx
// Correct: data-testid on HTML elements
<button data-testid="submit-button">Submit</button>
<div data-testid="container">Content</div>

// Correct: testId on React components
<Button testId="submit-button">Submit</Button>
<Link testId="home-link" href="/">Home</Link>
```

**Auto-fix:** This rule includes an auto-fix that will automatically convert `data-test-id` to `data-testid` and `testId` to `data-testid` on HTML elements.

Run `eslint --fix` to automatically fix these issues.

