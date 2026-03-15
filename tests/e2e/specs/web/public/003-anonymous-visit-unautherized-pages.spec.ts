/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import { readCreatedEvent } from '../helpers/event';
import { checkIfUnAuthorized } from '../helpers/navigation';

test.describe.configure({ mode: 'serial' });

test.describe('should not be authorized on the following pages', () => {
  let unAuthorizedUris: string[];

  test.beforeAll(() => {
    const createdEvent = readCreatedEvent();
    unAuthorizedUris = [
      '/admin',
      '/admin/events/create',
      '/user',
      `/user/events/${createdEvent.eventId}`,
    ];
  });

  test('unauthorized pages are unaccessible', async ({ page }) => {
    for (const uri of unAuthorizedUris) {
      await checkIfUnAuthorized(page, uri);
    }
  });
});
