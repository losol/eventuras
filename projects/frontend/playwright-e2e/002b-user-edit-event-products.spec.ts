/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import createdEvent from './createdEvent.json';
import { checkIfLoggedIn, editRegistrationOrders } from './functions';
test.describe.configure({ mode: 'serial' });
test.use({ storageState: 'playwright-auth/user.json' });

test.describe('edit event products', () => {
  test('check if logged in', async ({ page }) => {
    await checkIfLoggedIn(page);
  });

  test('edit event products', async ({ page }) => {
    await editRegistrationOrders(page, createdEvent.eventId);
  });
});
