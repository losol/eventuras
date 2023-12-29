/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import createdEvent from './createdEvent.json';
import { checkIfUnAuthorized } from './functions';

test.describe.configure({ mode: 'serial' });

const unAuthorizedUris = [
  '/admin',
  '/admin/events/create',
  '/user',
  `/user/events/${createdEvent.eventId}/register`,
];
test.describe('should not be authorized on the following pages', () => {
  test('unauthorized pages are unaccessible', async ({ page }) => {
    for (const uri of unAuthorizedUris) {
      await checkIfUnAuthorized(page, uri);
    }
  });
});
