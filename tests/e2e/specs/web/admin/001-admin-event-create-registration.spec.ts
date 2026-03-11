/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import { addProductToEvent, writeCreatedEvent } from '../helpers/event';
import { checkIfAccessToAdmin } from '../helpers/navigation';
import { createTestEvent } from '../helpers/eventCreation';

test.describe.configure({ mode: 'serial' });
const eventName = `This is a playwright event - ${Math.floor(Date.now() / 1000 / 10)}`;
let eventId: string;

test.use({ storageState: 'playwright-auth/admin.json' });
test.describe('create event and add products to it', () => {
  test('admin check', async ({ page }) => {
    await checkIfAccessToAdmin(page);
  });
  test('create event with rich content', async ({ page }) => {
    eventId = await createTestEvent(page, eventName);
    writeCreatedEvent(eventId);
  });

  test('add products to event', async ({ page }) => {
    await addProductToEvent(page, eventId);
  });
});
