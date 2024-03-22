/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import {
  addProductToEvent,
  checkIfAccessToAdmin,
  createEvent,
  writeCreatedEvent,
} from './functions';

test.describe.configure({ mode: 'serial' });
const eventName = `This is a playwright event - ${Math.floor(Date.now() / 1000 / 10)}`;
let eventId: string;

test.use({ storageState: 'playwright-auth/admin.json' });
test.describe('create event and add products to it', () => {
  test('admin check', async ({ page }) => {
    await checkIfAccessToAdmin(page);
  });
  test('create simple event', async ({ page }) => {
    eventId = await createEvent(page, eventName);
    writeCreatedEvent(eventId);
  });

  test('add products to event', async ({ page }) => {
    await addProductToEvent(page, eventId);
  });
});
