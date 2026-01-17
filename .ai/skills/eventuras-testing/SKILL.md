---
name: eventuras-testing
description: Running and managing tests in the Eventuras monorepo (xUnit backend tests, Playwright E2E tests, integration tests)
license: MIT
---

# Eventuras Testing Skill

## Overview

This skill provides comprehensive testing capabilities for the Eventuras monorepo, covering backend xUnit tests, frontend Playwright E2E tests, and integration testing patterns.

## Backend Testing (C# .NET)

### Running All Backend Tests

```bash
cd apps/api
dotnet test
```

### Running Specific Test Project

```bash
# Unit tests
dotnet test tests/Eventuras.UnitTests

# Integration tests
dotnet test tests/Eventuras.IntegrationTests

# Web API tests
dotnet test tests/Eventuras.WebApi.Tests
```

### Running Specific Test Class

```bash
dotnet test --filter "FullyQualifiedName~Eventuras.WebApi.Tests.EventsControllerTests"
```

### Running Specific Test Method

```bash
dotnet test --filter "FullyQualifiedName~Eventuras.WebApi.Tests.EventsControllerTests.GetEvents_ShouldReturnOk"
```

### Running Tests with Verbose Output

```bash
dotnet test --logger "console;verbosity=detailed"
```

### Running Tests with Code Coverage

```bash
dotnet test /p:CollectCoverage=true /p:CoverageReportsDirectory=./coverage
```

## Frontend E2E Testing (Playwright)

### Running All E2E Tests

```bash
cd apps/web-e2e
pnpm test
```

### Running Specific Test File

```bash
cd apps/web-e2e
pnpm playwright test playwright-e2e/admin-events.spec.ts
```

### Running Tests in UI Mode (for debugging)

```bash
cd apps/web-e2e
pnpm playwright test --ui
```

### Running Tests in Headed Mode

```bash
cd apps/web-e2e
pnpm playwright test --headed
```

### Running Tests for Specific Browser

```bash
cd apps/web-e2e
pnpm playwright test --project=chromium
pnpm playwright test --project=firefox
pnpm playwright test --project=webkit
```

### Show Test Report

```bash
cd apps/web-e2e
pnpm playwright show-report
```

## Integration Testing

### Database Setup

Integration tests use a PostgreSQL database. Connection string:

```
Host=localhost;Port=5432;Database=eventuras_test;Username=postgres;Password=postgres
```

The database is automatically configured when running in GitHub Actions environment.

### Authentication in Tests

Backend integration tests use mock authentication:

```csharp
// System admin
var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

// Specific user
var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

// User with specific role
var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

// Generic role
var client = _factory.CreateClient().Authenticated(role: "Admin");
```

Frontend E2E tests use setup projects defined in `playwright.config.ts`:
- `admin.auth.setup.ts` - Admin authentication
- `user.auth.setup.ts` - User authentication

## Common Testing Patterns

### Backend Test Structure

```csharp
[Fact]
public async Task MethodName_Scenario_ExpectedBehavior()
{
    // Arrange
    var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
    var eventData = new EventDto { /* ... */ };

    // Act
    var response = await client.PostAsync("/api/v3/events", eventData);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Created);
    var result = await response.Content.ReadFromJsonAsync<EventDto>();
    result.Should().NotBeNull();
}
```

### Frontend E2E Test Structure

```typescript
test('should create new event', async ({ page }) => {
  // Arrange
  await page.goto('/admin/events');
  
  // Act
  await page.getByRole('button', { name: 'New Event' }).click();
  await page.getByLabel('Title').fill('Test Event');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Assert
  await expect(page.getByText('Event created successfully')).toBeVisible();
});
```

## Test Debugging Tips

### Backend Tests

1. **Set breakpoints** in Visual Studio Code or Visual Studio
2. Use **Test Explorer** to run individual tests
3. Check **test output** for detailed error messages
4. Use `--logger "console;verbosity=detailed"` for more information

### Frontend E2E Tests

1. Use **`--ui` mode** for interactive debugging
2. Use **`--headed` mode** to see browser actions
3. Use **`--debug` flag** to pause execution
4. Check **Playwright trace** files for detailed execution
5. Use **browser DevTools** for inspecting elements

## Running Tests from Monorepo Root

```bash
# Run all tests (backend + frontend)
pnpm test

# Build and test web app
pnpm --filter @eventuras/web test

# Build and test API
cd apps/api && dotnet test
```

## CI/CD Testing

Tests run automatically in GitHub Actions:
- Backend tests run on every push
- E2E tests run on PR and main branch
- Database is automatically provisioned
- Test results are reported in PR checks

## When to Run Tests

- ✅ Before committing changes
- ✅ After implementing new features
- ✅ After fixing bugs
- ✅ Before creating PRs
- ✅ After updating dependencies
- ✅ When modifying shared libraries

## Test Coverage Goals

- Backend API endpoints: **>80%** coverage
- Business logic services: **>90%** coverage
- Critical user flows (E2E): **100%** coverage
- Shared libraries: **>85%** coverage
