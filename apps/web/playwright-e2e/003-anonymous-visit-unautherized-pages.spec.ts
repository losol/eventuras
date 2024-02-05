/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import { checkIfUnAuthorized, readCreatedEvent } from './functions';

test.describe.configure({ mode: 'serial' });

test.describe('should not be authorized on the following pages', () => {
  const unAuthorizedUris = [
    '/admin',
    '/admin/events/create',
    '/user',
    `/user/events/${readCreatedEvent().eventId}`,
  ];
  test('unauthorized pages are unaccessible', async ({ page }) => {
    for (const uri of unAuthorizedUris) {
      await checkIfUnAuthorized(page, uri);
    }
  });
});
