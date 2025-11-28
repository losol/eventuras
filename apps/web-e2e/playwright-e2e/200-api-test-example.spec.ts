/**
 * Example tests showing how to use the API helpers for backend testing.
 *
 * These are simple read-only tests that demonstrate:
 * - Unauthenticated API calls (public endpoints)
 * - Authenticated API calls (admin and user)
 * - No data modification (read-only)
 *
 * Prerequisites:
 * - SESSION_SECRET environment variable must be set
 * - EVENTURAS_TEST_EVENTS_API_BASE_URL must point to the backend API
 * - Auth storage files must exist (playwright-auth/admin.json, playwright-auth/user.json)
 */

import { test, expect } from '@playwright/test';
import { EventDto } from '@eventuras/event-sdk';
import { adminApi, userApi, publicApiRequest } from './api-helpers';

/**
 * Paginated response from the backend API
 */
interface PageResponse<T> {
  data: T[];
  page: number;
  count: number;
  total: number;
  pages: number;
}

test.describe('Backend API tests - Unauthenticated', () => {
  test('Can fetch public events list', async () => {
    const response = await publicApiRequest<PageResponse<EventDto>>('/v3/events');

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Public events have required fields', async () => {
    const response = await publicApiRequest<PageResponse<EventDto>>('/v3/events');

    if (response.data.length > 0) {
      const event = response.data[0];
      if (event) {
        expect(event.id).toBeDefined();
        expect(event.title).toBeDefined();
        expect(event.slug).toBeDefined();
      }
    }
  });
});

test.describe('Backend API tests - Admin authenticated', () => {
  test('Admin can fetch events from backend API', async () => {
    const response = await adminApi.get<PageResponse<EventDto>>('/v3/events');

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Admin can fetch specific event details', async () => {
    const response = await adminApi.get<PageResponse<EventDto>>('/v3/events');

    if (response.data.length > 0) {
      const firstEvent = response.data[0];
      if (firstEvent?.id) {
        const event = await adminApi.get<EventDto>(`/v3/events/${firstEvent.id}`);

        expect(event).toBeDefined();
        expect(event.id).toBe(firstEvent.id);
      }
    }
  });
});

test.describe('Backend API tests - User authenticated', () => {
  test('User can fetch their own registrations', async () => {
    const registrations = await userApi.get('/v3/registrations');

    expect(registrations).toBeDefined();
  });

  test('User can fetch public events', async () => {
    const response = await userApi.get<PageResponse<EventDto>>('/v3/events');

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
