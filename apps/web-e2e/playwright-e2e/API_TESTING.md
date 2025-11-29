# Backend API Testing with Playwright

This guide explains how to test the backend API directly from Playwright E2E tests using authenticated sessions.

## Overview

The `api-helpers.ts` module provides functions to:
1. **Decrypt the session cookie** from Playwright's auth storage
2. **Extract the access token** from the decrypted session
3. **Make authenticated API requests** to the backend using the token

## Prerequisites

### 1. Environment Variables

Make sure these environment variables are set in your `.env` file or test environment:

```bash
# Backend API base URL
EVENTURAS_TEST_EVENTS_API_BASE_URL=http://localhost:5000

# Session encryption secret (same as used by Next.js app)
SESSION_SECRET=your-hex-encoded-secret-key
```

### 2. Auth Storage Files

Playwright auth setup must have run successfully, creating:
- `playwright-auth/admin.json` - Admin user session
- `playwright-auth/user.json` - Regular user session

These files are created automatically by the auth setup projects defined in `playwright.config.ts`.

## Usage

### Basic API Calls

```typescript
import { adminApi, userApi } from './api-helpers';

// Admin API calls
const events = await adminApi.get<EventDto[]>('/v3/events');
const newEvent = await adminApi.post<EventDto>('/v3/events', eventData);
await adminApi.put<EventDto>(`/v3/events/${id}`, updatedData);
await adminApi.delete(`/v3/events/${id}`);

// User API calls
const registrations = await userApi.get('/v3/registrations');
const registration = await userApi.post('/v3/registrations', registrationData);
```

### Combined UI + API Testing

Test pattern that combines Playwright UI automation with backend API verification:

```typescript
test('Create event in UI and verify via API', async ({ page }) => {
  // 1. Use Playwright to fill form in UI
  await page.goto('/admin/events/new');
  await page.fill('[name="title"]', 'My Test Event');
  await page.click('button[type="submit"]');
  
  // 2. Verify the event was created by querying the backend API
  const events = await adminApi.get<EventDto[]>('/v3/events');
  const createdEvent = events.find(e => e.title === 'My Test Event');
  
  expect(createdEvent).toBeDefined();
  expect(createdEvent?.slug).toBeTruthy();
});
```

### Pure Backend Testing

Test backend logic without UI interaction:

```typescript
test('Admin can manage event products', async () => {
  // Create an event
  const event = await adminApi.post<EventDto>('/v3/events', {
    title: 'Product Test Event',
    slug: `test-${Date.now()}`,
    dateStart: new Date().toISOString(),
    dateEnd: new Date(Date.now() + 86400000).toISOString(),
  });
  
  // Add a product to the event
  const product = await adminApi.post(`/v3/events/${event.id}/products`, {
    name: 'Test Product',
    price: 100,
    description: 'A test product',
  });
  
  expect(product.name).toBe('Test Product');
  expect(product.price).toBe(100);
});
```

## How It Works

### Session Decryption

The session cookie stored by Playwright contains a JWE (JSON Web Encryption) token. The `api-helpers` module:

1. Reads the session cookie from Playwright's auth storage file
2. Uses a local `hexToUint8Array()` function (copied from `@eventuras/fides-auth/utils` for ESM/CommonJS compatibility) to get the session encryption key
3. Uses the `jose` library to decrypt the JWE token (same method as the application)
4. Extracts the `accessToken` from the decrypted session payload
5. Uses the access token for authenticated API requests

This approach uses a local copy of the encryption utility to avoid ESM/CommonJS compatibility issues, but the logic matches the main application.

### Code Structure

```typescript
// Get session secret (using local hexToUint8Array, copied from @eventuras/fides-auth/utils)
hexToUint8Array(SESSION_SECRET)
  → Uint8Array (encryption key)

// Decrypt JWE session token (using jose library)
decryptSessionToken(jweToken) 
  → { tokens: { accessToken, refreshToken }, user: { ... } }

// Extract token from auth storage
getAccessTokenFromAuthFile('playwright-auth/admin.json')
  → 'eyJhbGci...' (JWT access token)

// Make authenticated request
apiRequest('/v3/events', 'playwright-auth/admin.json')
  → Adds 'Authorization: Bearer {token}' header
  → Returns parsed JSON response
```

## Troubleshooting

### "SESSION_SECRET is not defined"

Make sure `SESSION_SECRET` is set in your environment. This should be the same hex-encoded secret used by the Next.js application.

### "No session cookie found"

The auth setup didn't run successfully. Make sure to run Playwright with proper dependencies:

```bash
pnpm test:playwright
```

### "Failed to decrypt session token"

The `SESSION_SECRET` might be incorrect or the session format changed. Verify that:
1. The same secret is used in both Next.js app and tests
2. The session cookie name is still "session"
3. The session encryption format hasn't changed

### API request returns 401 Unauthorized

The access token might be expired. Playwright auth storage is saved for a limited time. Re-run the auth setup:

```bash
pnpm test:playwright --project="admin.auth.setup"
```

## Example Test File

See `200-api-test-example.spec.ts` for complete examples of:
- Simple API calls
- Combined UI + API tests
- Error handling
- TypeScript typing with SDK models
