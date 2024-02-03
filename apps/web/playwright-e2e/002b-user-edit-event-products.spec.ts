/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import { checkIfLoggedIn, editRegistrationOrders, readCreatedEvent } from './functions';
test.describe.configure({ mode: 'serial' });
test.use({ storageState: 'playwright-auth/user.json' });

//TODO skip this one, as editing a registration is not currently possible

test.skip('edit event products', () => {
  test('check if logged in', async ({ page }) => {
    await checkIfLoggedIn(page);
  });


  test('edit event products', async ({ page }) => {
    await editRegistrationOrders(page, readCreatedEvent().eventId);
  });
});
