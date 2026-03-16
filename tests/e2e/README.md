# Frontend E2E Testing

End-to-end tests for the Eventuras web application using Playwright.

## Quick Start

```bash
cd tests/e2e

# 1. Install Playwright browsers
npx playwright install

# 2. Set up environment
cp .env-template .env

# 3. Set the required URLs in .env:
#    E2E_WEB_URL=http://localhost:3000    (your running web app)
#    E2E_API_URL=http://localhost:5000    (your running API)
#    E2E_SESSION_SECRET=...               (must match the web app's SESSION_SECRET)
#    + Gmail OAuth credentials (see below)

# 4. Run all tests
pnpm test

# 5. Skip login if auth tokens are still valid
pnpm test:skiplogin
```

> **Minimum required variables:** `E2E_WEB_URL` and `E2E_API_URL` must be set.
> The web URL is used by Playwright as `baseURL` for navigation.
> The API URL is used for direct API calls in test setup/teardown.

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
DEBUG=e2e* pnpm test

# Enable specific namespaces
DEBUG=e2e pnpm test        # Main test functions
DEBUG=e2e:utils pnpm test   # Utility functions
DEBUG=e2e:test pnpm test    # Test specs

# Multiple namespaces
DEBUG=e2e,e2e:utils pnpm test

# Disable all (default)
pnpm test
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

Every time an event is created, `tmp/state/createdEvent.json` is updated with the event ID. This allows subsequent tests (user/anonymous) to work with a fresh event.

## Authentication

Playwright stores browser state in the `tmp/auth/` folder with two states:

- `admin.json` - Admin user session
- `user.json` - Regular user session

This avoids re-authentication between test runs.

### Skip Login Between Runs

If the auth JSON files are still valid, skip login setup:

```bash
pnpm test:skiplogin
```

## OTP Fetching

The Gmail API (via `@eventuras/google-api`) is used to fetch one-time verification codes for:

- Admin login
- User login
- Anonymous user registration

### Setup Requirements

**📖 See [GMAIL_SETUP.md](./GMAIL_SETUP.md) for detailed step-by-step setup instructions.**

Quick overview:

1. **Configure Google OAuth credentials** - Set up OAuth client in Google Cloud Console (see [GMAIL_SETUP.md](./GMAIL_SETUP.md))
2. **Obtain a refresh token** - Run `pnpm oauth:setup` or use OAuth 2.0 Playground (see [GMAIL_SETUP.md](./GMAIL_SETUP.md#step-3-obtain-refresh-token))
3. **Set environment variables** in `.env`:
   - `EVENTURAS_TEST_BASE_EMAIL` - Your Gmail account (e.g., `youremail@gmail.com`)
   - `EVENTURAS_TEST_GOOGLE_CLIENT_ID` - OAuth client ID from Google Cloud Console
   - `EVENTURAS_TEST_GOOGLE_CLIENT_SECRET` - OAuth client secret
   - `EVENTURAS_TEST_GOOGLE_REDIRECT_URI` - Use `http://localhost:3123/oauth/callback` (or `https://developers.google.com/oauthplayground` for manual setup)
   - `EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN` - Refresh token obtained from OAuth flow **OR** store it in `test-results/.google-refresh-token` file (recommended for CI/CD)

### Gmail Plus Addressing

Tests use Gmail's [plus addressing feature](https://gmail.googleblog.com/2008/03/2-hidden-ways-to-get-more-from-your.html) to create unique email identities from a single Gmail account.

Set `EVENTURAS_TEST_BASE_EMAIL` to your Gmail address (e.g., `youremail@gmail.com`), and the tests will automatically generate:

- **Admin user**: `{base}+admin@gmail.com` (from `EVENTURAS_TEST_BASE_EMAIL`)
- **Standard user**: `{base}+user@gmail.com` (from `EVENTURAS_TEST_BASE_EMAIL`)
- **Anonymous users**: `{base}+newuser-{timestamp}@gmail.com` (auto-generated for each test run)

All emails are delivered to the same inbox, making it easy to manage test accounts.

## Test Account Setup

Anonymous tests register themselves automatically using Gmail plus addressing. For Admin and User tests, follow these steps:

### Step 1: Create and Register the User

1. Use your Gmail account with plus addressing to create test identities:

   ```text
   youremail+admin@gmail.com   (for admin user)
   youremail+user@gmail.com    (for regular user)
   ```

2. Register on Eventuras using these email addresses
3. Check your Gmail inbox for verification codes (all emails arrive in the same inbox)
4. Complete the registration process

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
