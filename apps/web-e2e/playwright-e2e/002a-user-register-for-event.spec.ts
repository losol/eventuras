/* eslint no-process-env: 0 */

import { Logger } from '@eventuras/utils';
import { test } from '@playwright/test';

import {
  checkIfLoggedIn,
  readCreatedEvent,
  registerForEvent,
  validateRegistration,
} from './functions';
test.describe.configure({ mode: 'serial' });
test.use({ storageState: 'playwright-auth/user.json' });

test.describe('register for event', () => {
  const createdEvent = readCreatedEvent();
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
