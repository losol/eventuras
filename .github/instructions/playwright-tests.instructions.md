---
applyTo: "**/playwright-e2e/**/*.spec.ts"
---

# Playwright Test Requirements

When writing or modifying Playwright tests, follow these guidelines to ensure consistency, reliability, and maintainability:

## Test Structure

### File Organization

- Test files must use the `*.spec.ts` naming convention
- Group related tests in logical files (e.g., `admin-events.spec.ts`, `user-registration.spec.ts`)
- Use setup files for authentication: `admin.auth.setup.ts`, `user.auth.setup.ts`
- Store shared utilities in `utils/` directory

### Test Naming

- Use descriptive test names that explain the user scenario
- Format: `test('should [action] when [condition]', async ({ page }) => { ... })`
- Example: `test('should create new event when admin submits valid form', ...)`

## Locator Best Practices

### Preferred Locators (in order of preference)

1. **Role-based**: `page.getByRole('button', { name: 'Submit' })`
2. **Label-based**: `page.getByLabel('Email address')`
3. **Test ID**: `page.getByTestId('submit-button')` (only when role/label unavailable)
4. **Avoid**: CSS selectors, XPath

### Why?

- Role-based locators ensure accessibility compliance
- They're resilient to DOM structure changes
- They reflect how users actually interact with the UI

## Assertions

### Use Playwright's Built-in Matchers

```typescript
// ✅ Good - specific and clear
await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
await expect(page.getByText("Successfully created")).toHaveText(
  "Successfully created",
);
await expect(page).toHaveURL(/\/admin\/events\/\d+/);

// ❌ Avoid - too generic
await expect(something).toBeTruthy();
```

### Common Matchers

- `toBeVisible()` - element is present and visible
- `toHaveText()` - exact text match
- `toContainText()` - partial text match
- `toHaveValue()` - for input fields
- `toHaveURL()` - URL checks (supports regex)
- `toHaveCount()` - number of elements

## Auto-Wait and Timeouts

### Rely on Playwright's Auto-Wait

```typescript
// ✅ Good - Playwright waits automatically
await page.getByRole("button", { name: "Load More" }).click();
await expect(page.getByText("Item 11")).toBeVisible();

// ❌ Avoid - manual timeouts
await page.waitForTimeout(3000); // Don't do this!
```

### When Manual Waiting is Needed

```typescript
// Wait for specific network state
await page.waitForLoadState("networkidle");

// Wait for a specific condition
await page.waitForFunction(
  () => document.querySelectorAll(".item").length > 10,
);
```

## Test Isolation

### Each Test Must Be Independent

```typescript
// ✅ Good - setup in beforeEach
test.describe('Event Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/events');
    // Fresh state for each test
  });

  test('should create event', async ({ page }) => { ... });
  test('should edit event', async ({ page }) => { ... });
});

// ❌ Avoid - tests depending on each other
test('create event', async ({ page }) => { /* creates event */ });
test('edit the event from previous test', async ({ page }) => { /* will fail if run alone */ });
```

### Cleanup

- Use `test.afterEach()` for cleanup when necessary
- Prefer creating test data over sharing it between tests
- Use unique identifiers (timestamps, UUIDs) for test data

## Authentication Setup

### Use Setup Projects

- Admin auth: defined in `admin.auth.setup.ts`
- User auth: defined in `user.auth.setup.ts`
- Tests depend on these setup projects (see `playwright.config.ts`)

### Reuse Authentication State

```typescript
// Setup projects save auth state
// Individual tests automatically use saved state via dependencies
test("admin can access dashboard", async ({ page }) => {
  // Already authenticated as admin
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

## Page Object Model (Optional but Recommended)

For complex, reused workflows, consider Page Objects:

```typescript
// e2e-utils/pages/EventPage.ts
export class EventPage {
  constructor(private page: Page) {}

  async createEvent(name: string, description: string) {
    await this.page.getByRole("button", { name: "Create Event" }).click();
    await this.page.getByLabel("Event Name").fill(name);
    await this.page.getByLabel("Description").fill(description);
    await this.page.getByRole("button", { name: "Submit" }).click();
  }

  async expectEventVisible(name: string) {
    await expect(this.page.getByRole("heading", { name })).toBeVisible();
  }
}
```

## Configuration

### Test Configuration (from `playwright.config.ts`)

- Base URL: `process.env.TEST_BASE_URL`
- Locale: `en-GB`
- Timezone: `Europe/Paris`
- Timeout: 10 minutes max
- Workers: 1 (no parallel execution)
- Traces: Always on

### Environment Variables

- Load from `.env` file in `apps/web-e2e/`
- Required: `TEST_BASE_URL`, auth credentials
- Never commit `.env` to version control

## Testing Checklist

Before submitting tests:

- [ ] Tests run successfully in isolation (`pnpm test --grep "test name"`)
- [ ] Tests use semantic locators (role, label, testId)
- [ ] Assertions are specific and meaningful
- [ ] No hardcoded waits (`waitForTimeout`)
- [ ] Test names clearly describe the scenario
- [ ] Authentication state is reused (not re-logging in each test)
- [ ] Tests are independent and can run in any order

## Common Patterns

### Form Submission

```typescript
test("should submit contact form", async ({ page }) => {
  await page.goto("/contact");

  // Fill form
  await page.getByLabel("Name").fill("John Doe");
  await page.getByLabel("Email").fill("john@example.com");
  await page.getByLabel("Message").fill("Test message");

  // Submit
  await page.getByRole("button", { name: "Send" }).click();

  // Verify success
  await expect(page.getByText("Message sent successfully")).toBeVisible();
});
```

### Navigation and URL Verification

```typescript
test("should navigate to event details", async ({ page }) => {
  await page.goto("/events");

  await page.getByRole("link", { name: "Summer Conference 2025" }).click();

  await expect(page).toHaveURL(/\/events\/\d+/);
  await expect(
    page.getByRole("heading", { name: "Summer Conference 2025" }),
  ).toBeVisible();
});
```

### Handling Dialogs

```typescript
test("should confirm deletion", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());

  await page.getByRole("button", { name: "Delete Event" }).click();

  await expect(page.getByText("Event deleted")).toBeVisible();
});
```

## Running Tests

### Commands

```bash
# Run all tests
cd apps/web-e2e && pnpm test

# Run specific test file
pnpm test playwright-e2e/admin-events.spec.ts

# Run in UI mode (for debugging)
pnpm playwright test --ui

# Show test report
pnpm playwright show-report
```

### Debugging

- Use `await page.pause()` to pause execution and inspect
- Enable headed mode: `pnpm playwright test --headed`
- Use trace viewer: `pnpm playwright show-trace`

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Authentication](https://playwright.dev/docs/auth)
