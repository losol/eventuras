/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import Logger from '@/utils/Logger';

import createdEvent from './createdEvent.json';
import { checkIfLoggedIn, registerForEvent, validateRegistration } from './functions';
test.describe.configure({ mode: 'serial' });
test.use({ storageState: 'playwright-auth/user.json' });

test.describe('register for event', () => {
  test.beforeAll(() => {
    if (!createdEvent.eventId) {
      Logger.error(
        { namespace: 'e2e' },
        'No event was created previously, run admin-event-create-registration tests first'
      );
    }
  });

  test('check if logged in', async ({ page }) => {
    await checkIfLoggedIn(page);
  });

  test('register for event', async ({ page }) => {
    await registerForEvent(page, createdEvent.eventId);
  });

  test('validate event registration', async ({ page }) => {
    await validateRegistration(page, createdEvent.eventId);
  });
});
