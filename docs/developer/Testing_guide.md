# Testing Guide

This guide covers testing strategies, tools, and best practices for the Eventuras project.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Backend Testing (.NET)](#backend-testing-net)
- [Frontend Testing (TypeScript/React)](#frontend-testing-typescriptreact)
- [End-to-End Testing](#end-to-end-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Eventuras uses a multi-layered testing approach to ensure code quality and reliability:

- **Unit Tests** - Test individual functions and classes in isolation
- **Integration Tests** - Test interactions between components and with the database
- **End-to-End (E2E) Tests** - Test complete user workflows through the UI
- **Component Tests** - Test UI components in isolation with Storybook

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /____\     - Critical user journeys
     /      \    - Complete workflows
    /________\   
   /          \  Integration Tests (Some)
  /            \ - API endpoints
 /______________\- Database interactions
/                \
/                 \ Unit Tests (Many)
/___________________\ - Business logic
                      - Utilities
                      - Validators
```

### What to Test

#### ✅ Always Test
- Business logic and calculations
- Data validation and transformations
- Error handling and edge cases
- API endpoints and responses
- Critical user workflows (registration, payment)
- Security and authentication logic

#### ⚠️ Sometimes Test
- UI component behavior
- Complex UI interactions
- Third-party integrations
- Performance-critical code

#### ❌ Don't Test
- Framework internals
- Third-party library code
- Trivial getters/setters
- Simple pass-through functions

## Backend Testing (.NET)

### Testing Framework

The backend uses **xUnit** for testing with these supporting libraries:

- **xUnit** - Test framework
- **Moq** - Mocking framework
- **FluentAssertions** - Assertion library
- **Microsoft.EntityFrameworkCore.InMemory** - In-memory database for tests
- **WebApplicationFactory** - Integration testing

### Project Structure

```
apps/api/
├── tests/
│   ├── Eventuras.UnitTests/          # Unit tests
│   ├── Eventuras.IntegrationTests/   # Integration tests
│   └── Eventuras.TestAbstractions/   # Shared test utilities
└── src/
    └── Eventuras.WebApi/             # Application code
```

### Unit Tests

Unit tests focus on testing individual classes and methods in isolation.

**Example: Testing a Service**

```csharp
using Xunit;
using Moq;
using FluentAssertions;

namespace Eventuras.UnitTests.Services
{
    public class EventServiceTests
    {
        [Fact]
        public async Task CreateEvent_ShouldReturnCreatedEvent()
        {
            // Arrange
            var mockRepo = new Mock<IEventRepository>();
            var service = new EventService(mockRepo.Object);
            var eventDto = new EventDto { Title = "Test Event" };

            mockRepo
                .Setup(r => r.AddAsync(It.IsAny<Event>()))
                .ReturnsAsync(new Event { Id = 1, Title = "Test Event" });

            // Act
            var result = await service.CreateEventAsync(eventDto);

            // Assert
            result.Should().NotBeNull();
            result.Title.Should().Be("Test Event");
            mockRepo.Verify(r => r.AddAsync(It.IsAny<Event>()), Times.Once);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public async Task CreateEvent_WithInvalidTitle_ShouldThrowException(string title)
        {
            // Arrange
            var mockRepo = new Mock<IEventRepository>();
            var service = new EventService(mockRepo.Object);
            var eventDto = new EventDto { Title = title };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                () => service.CreateEventAsync(eventDto)
            );
        }
    }
}
```

### Integration Tests

Integration tests verify that components work together correctly, including database interactions.

**Example: Testing an API Endpoint**

```csharp
using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;

namespace Eventuras.IntegrationTests.Controllers
{
    public class EventsControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public EventsControllerTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetEvents_ShouldReturnOkWithEvents()
        {
            // Act
            var response = await _client.GetAsync("/api/v3/events");

            // Assert
            response.Should().BeSuccessful();
            var events = await response.Content.ReadFromJsonAsync<List<EventDto>>();
            events.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateEvent_WithValidData_ShouldReturnCreated()
        {
            // Arrange
            var newEvent = new EventDto { Title = "Integration Test Event" };

            // Act
            var response = await _client.PostAsJsonAsync("/api/v3/events", newEvent);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var created = await response.Content.ReadFromJsonAsync<EventDto>();
            created.Title.Should().Be("Integration Test Event");
        }
    }
}
```

### Running Backend Tests

```bash
# Run all tests
cd apps/api
dotnet test

# Run tests with detailed output
dotnet test --verbosity normal

# Run tests in a specific project
dotnet test tests/Eventuras.UnitTests

# Run tests with code coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "FullyQualifiedName~EventServiceTests.CreateEvent_ShouldReturnCreatedEvent"
```

### Database Testing

For integration tests that need a database, use the in-memory provider:

```csharp
public class TestDbContext
{
    public static ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
```

## Frontend Testing (TypeScript/React)

### Testing Tools

- **Playwright** - E2E testing (primary)
- **Storybook** - Component development and testing
- **React Testing Library** - Component testing (if implemented)

### Component Testing with Storybook

Storybook allows you to develop and test components in isolation.

**Example: Button Component Story**

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled',
    disabled: true,
  },
};
```

Run Storybook:
```bash
cd apps/web
npm run storybook
```

### Running Storybook Tests

```bash
# Start Storybook
npm run storybook

# Run Storybook tests (if configured)
npm run test-storybook
```

## End-to-End Testing

### Playwright Configuration

E2E tests are located in `apps/web-e2e/` and use Playwright.

**Configuration:** `apps/web-e2e/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Writing E2E Tests

**Example: Event Registration Flow**

```typescript
// tests/event-registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Event Registration', () => {
  test('should allow user to register for an event', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events');
    
    // Find and click on an event
    await page.getByRole('link', { name: 'Test Conference 2024' }).click();
    
    // Verify event details page
    await expect(page).toHaveURL(/\/events\/\d+/);
    await expect(page.getByRole('heading', { name: 'Test Conference 2024' }))
      .toBeVisible();
    
    // Click register button
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Fill registration form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john.doe@example.com');
    
    // Select a product
    await page.getByRole('checkbox', { name: 'Workshop A' }).check();
    
    // Submit registration
    await page.getByRole('button', { name: 'Complete Registration' }).click();
    
    // Verify success
    await expect(page.getByText('Registration successful!')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/events/1');
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Complete Registration' }).click();
    
    // Check for validation messages
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('First name is required')).toBeVisible();
  });
});
```

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
cd apps/web-e2e
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run tests in UI mode (interactive)
npm run test:e2e -- --ui

# Run specific test file
npm run test:e2e -- tests/event-registration.spec.ts

# Run tests in a specific browser
npm run test:e2e -- --project=chromium

# Debug tests
npm run test:e2e -- --debug
```

### E2E Test Patterns

#### Page Object Model

Create reusable page objects for better maintainability:

```typescript
// pages/EventPage.ts
import { Page, Locator } from '@playwright/test';

export class EventPage {
  readonly page: Page;
  readonly title: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { level: 1 });
    this.registerButton = page.getByRole('button', { name: 'Register' });
  }

  async goto(eventId: number) {
    await this.page.goto(`/events/${eventId}`);
  }

  async register() {
    await this.registerButton.click();
  }
}

// Use in test
import { EventPage } from './pages/EventPage';

test('register for event', async ({ page }) => {
  const eventPage = new EventPage(page);
  await eventPage.goto(1);
  await eventPage.register();
});
```

#### Test Fixtures

Create reusable fixtures for common setup:

```typescript
// fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@email.com');
    await page.fill('input[name="password"]', 'Str0ng!PaSsw0rd');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});

// Use in test
import { test } from './fixtures/auth';

test('create event as admin', async ({ authenticatedPage }) => {
  // Already logged in
  await authenticatedPage.goto('/admin/events/create');
});
```

## Running Tests

### Run All Tests

```bash
# From project root
npm run test

# Backend tests
cd apps/api
dotnet test

# Frontend E2E tests
cd apps/web-e2e
npm run test:e2e
```

### Run Tests in CI/CD

Tests automatically run in GitHub Actions on every push and pull request.

**GitHub Actions Workflow:**
```yaml
- name: Run Backend Tests
  run: |
    cd apps/api
    dotnet test --no-build --verbosity normal

- name: Run E2E Tests
  run: |
    cd apps/web-e2e
    npx playwright install --with-deps
    npm run test:e2e
```

### Watch Mode

```bash
# Watch backend tests (requires dotnet-watch)
cd apps/api
dotnet watch test

# Watch Playwright tests
cd apps/web-e2e
npm run test:e2e -- --ui
```

## Writing Tests

### Test Naming Conventions

#### Backend (C#)
```csharp
// Pattern: MethodName_Scenario_ExpectedBehavior
[Fact]
public void CreateEvent_WithValidData_ShouldReturnEvent() { }

[Theory]
[InlineData(null)]
public void CreateEvent_WithNullTitle_ShouldThrowException(string title) { }
```

#### Frontend (TypeScript)
```typescript
// Pattern: should [expected behavior] when [scenario]
test('should display error message when email is invalid', async ({ page }) => {
  // ...
});

test.describe('Event Registration', () => {
  test('should complete registration successfully', async ({ page }) => {
    // ...
  });
});
```

### Arrange-Act-Assert Pattern

Always structure tests clearly:

```csharp
[Fact]
public async Task Example_Test()
{
    // Arrange - Set up test data and dependencies
    var service = new EventService();
    var eventData = new EventDto { Title = "Test" };

    // Act - Execute the method being tested
    var result = await service.CreateEventAsync(eventData);

    // Assert - Verify the results
    result.Should().NotBeNull();
    result.Title.Should().Be("Test");
}
```

### Test Data Management

#### Use Builders for Complex Objects

```csharp
public class EventBuilder
{
    private Event _event = new Event();

    public EventBuilder WithTitle(string title)
    {
        _event.Title = title;
        return this;
    }

    public EventBuilder WithDateRange(DateTime start, DateTime end)
    {
        _event.StartDate = start;
        _event.EndDate = end;
        return this;
    }

    public Event Build() => _event;
}

// Usage
var event = new EventBuilder()
    .WithTitle("Test Event")
    .WithDateRange(DateTime.Now, DateTime.Now.AddDays(7))
    .Build();
```

#### Use Realistic Test Data

```csharp
// ❌ Bad - Magic numbers and strings
var user = new User { Id = 1, Name = "test" };

// ✅ Good - Descriptive and realistic
var user = new User 
{ 
    Id = 123, 
    Name = "John Doe",
    Email = "john.doe@example.com"
};
```

## Best Practices

### General Testing Principles

1. **Tests Should Be Independent** - Each test should run in isolation
2. **Tests Should Be Deterministic** - Same input = same output, every time
3. **Tests Should Be Fast** - Quick feedback is crucial
4. **Tests Should Be Readable** - Clear intent and structure
5. **Don't Test Implementation Details** - Test behavior, not internals

### Backend Best Practices

- Use `InMemoryDatabase` for integration tests
- Mock external dependencies (HTTP clients, email services)
- Use `Theory` for multiple similar test cases
- Clean up resources in `Dispose` or `IAsyncLifetime`
- Use meaningful assertion messages

```csharp
// ✅ Good - Clear assertion message
result.Should().NotBeNull("Event creation should return a valid event");

// ❌ Bad - No context when it fails
Assert.NotNull(result);
```

### Frontend Best Practices

- Test user flows, not implementation
- Use data-testid sparingly, prefer role/label selectors
- Avoid testing CSS/styling details
- Test accessibility (screen reader compatibility)
- Use realistic user interactions

```typescript
// ✅ Good - User-centric
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ Bad - Implementation-specific
await page.click('#submit-btn-123');
```

### E2E Best Practices

- Test critical user journeys only
- Use Page Object Model for reusability
- Set up test data programmatically (API calls)
- Clean up test data after tests
- Use visual regression testing for UI consistency

## Troubleshooting

### Backend Tests Failing

**Issue:** Database connection errors

**Solution:**
```bash
# Use in-memory database for tests
dotnet test
```

**Issue:** Tests fail intermittently

**Solution:** Check for async issues, race conditions, or shared state

### E2E Tests Failing

**Issue:** Element not found

**Solution:**
```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="event-title"]');
```

**Issue:** Tests timeout

**Solution:**
```typescript
// Increase timeout
test.setTimeout(60000); // 60 seconds

// Or in config
use: {
  timeout: 30000,
}
```

**Issue:** Flaky tests

**Solutions:**
- Use `waitFor` methods instead of hard timeouts
- Ensure proper test isolation
- Use auto-retrying assertions: `await expect(...).toBeVisible()`

### Test Coverage

Generate coverage reports:

```bash
# Backend coverage
cd apps/api
dotnet test --collect:"XPlat Code Coverage"

# View coverage report
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report
```

## Continuous Improvement

### Code Coverage Goals

- **Unit Tests:** Aim for 80%+ coverage of business logic
- **Integration Tests:** Cover all API endpoints
- **E2E Tests:** Cover critical user flows

### Review Process

- All new features must include tests
- PRs should not decrease overall coverage
- Tests must pass before merging
- Flaky tests should be fixed immediately

## Further Reading

- [Playwright Documentation](https://playwright.dev/)
- [xUnit Documentation](https://xunit.net/)
- [Storybook Documentation](https://storybook.js.org/)
- [Testing Best Practices](https://testingjavascript.com/)
