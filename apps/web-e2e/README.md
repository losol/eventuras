# Frontend E2E Testing

End-to-end tests for the Eventuras web application using Playwright.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Debug Output](#debug-output)
- [Creating New Tests](#creating-new-tests)
- [Authentication](#authentication)
- [OTP Fetching](#otp-fetching)
- [Test Account Setup](#test-account-setup)

## Overview

Tests are organized into 3 separate scopes:

- **Admin** - Tests requiring admin privileges
- **User** - Tests for registered users
- **Anonymous** - Tests for unregistered users (randomly generated each time)

**Important Notes:**
- Tests run in serial (5+ minutes total) due to dependencies
- Event creation must happen before registration tests
- Admin and User accounts must be pre-registered (see [Test Account Setup](#test-account-setup))

## Getting Started

1. Make sure playwright and browsers are installed by running `npx playwright install`. 
2. Take a look on the .env variables needed
3. test away!

## Debug Output

This test suite uses the `Debug` utility from `@eventuras/logger` for development-time debugging output.

### Using Debug in Tests

Import and create a debug instance:

```typescript
import { Debug } from '@eventuras/logger';

const debug = Debug.create('e2e:mytest');
```

Use with printf-style formatting:

```typescript
debug('Test step completed');
debug('User logged in: %s', username);
debug('Event created with ID: %d', eventId);
debug('Event: %j', eventObject);
```

### Running Tests with Debug Output

```bash
# Enable all e2e debug output
DEBUG=e2e* pnpm test:playwright

# Enable specific namespaces
DEBUG=e2e pnpm test:playwright        # Main test functions
DEBUG=e2e:utils pnpm test:playwright   # Utility functions
DEBUG=e2e:test pnpm test:playwright    # Test specs

# Multiple namespaces
DEBUG=e2e,e2e:utils pnpm test:playwright

# Disable all (default)
pnpm test:playwright
```

## Creating New Tests

Each test flow runs in its own file as a suite of tests. Files are numbered to ensure they run in the correct order (Playwright runs tests alphabetically).

### Test File Naming Convention

```
{number}-{scope}-{scenario-name}.spec.ts
```

**Examples:**
- `001-admin-create-event.spec.ts`
- `002a-user-register-for-event.spec.ts`
- `003-anonymous-view-event.spec.ts`

**Scopes:**
- `admin` - Requires admin authentication
- `user` - Requires user authentication
- `anonymous` - No authentication required

### Test Dependencies

Consider the execution order:
1. Events must be created (admin) before registration tests
2. Products must exist before product editing tests
3. Number your test file appropriately based on dependencies

### Event Data Persistence

Every time an event is created, `createdEvent.json` is updated with the event ID. This allows subsequent tests (user/anonymous) to work with a fresh event.

## Authentication

Playwright stores browser state in the `playwright-auth/` folder with two states:
- `admin.json` - Admin user session
- `user.json` - Regular user session

This avoids re-authentication between test runs.

### Skip Login Between Runs

If the auth JSON files are still valid, skip login setup:

```bash
pnpm test:playwright:skiplogin
```

## OTP Fetching

[Testmail.app](https://testmail.app) is used to fetch one-time verification codes via their API for:
- Admin login
- User login  
- Anonymous user registration

**Note:** Free API keys have a limit of 100 emails per month.

## Test Account Setup

Anonymous tests register themselves automatically. For Admin and User tests, follow these steps:

### Step 1: Create and Register the User

1. Login to [testmail.app](https://testmail.app)
2. Create a tagged email address:
   ```
   {testmailaccount}.admin@inbox.testmail.app
   ```
3. Register on Eventuras using this email
4. View verification code in the [JSON email viewer](https://testmail.app/console)

### Step 2: Add User to Organization

Create a PUT request to add the user to the organization:

**Endpoint:**
```
PUT {{baseUrl}}/v3/organizations/{{organizationId}}/members/{{targetUserId}}
```

**Parameters:**
- `baseUrl` - API base URL
- `organizationId` - Organization ID (typically `1`)
- `targetUserId` - User ID from registration

**Requirements:** Admin authentication token

### Step 3: Grant Admin Rights (For Admin Users Only)

1. First, ensure the user has admin rights in Auth0

2. Add the admin role via API:

   **Endpoint:**
   ```
   POST {{baseUrl}}/v3/organizations/{{organizationId}}/members/{{targetUserId}}/roles
   ```

   **Body:**
   ```json
   {
     "role": "Admin"
   }
   ```

3. Verify the role was added:

   **Endpoint:**
   ```
   GET {{baseUrl}}/v3/organizations/{{organizationId}}/members/{{targetUserId}}/roles
   ```

### Step 4: Configure Test Environment

Once the user is registered and configured:

1. For **Admin users**: Update environment variables with the admin email
2. For **Regular users**: Update `user.auth.setup.ts` with the user email (uses environment variable)
