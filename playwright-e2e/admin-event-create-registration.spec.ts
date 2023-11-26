/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import {
  addProductToEvent,
  checkIfAccessToAdmin,
  createEvent,
  registerForEvent,
  validateRegistration,
} from './functions';

test.describe.configure({ mode: 'serial' });
const eventName = `This is a playwright event - ${Math.floor(Date.now() / 1000 / 10)}`;
let eventId: string;

test.describe('create event and add products to it', () => {
  test('admin check', async ({ page }) => {
    await checkIfAccessToAdmin(page);
  });
  test('create simple event', async ({ page }) => {
    eventId = await createEvent(page, eventName);
  });

  test('add products to event', async ({ page }) => {
    await addProductToEvent(page, eventId);
  });
  test('register for event', async ({ page }) => {
    await registerForEvent(page, eventId!);
  });

  test('validate event registration', async ({ page }) => {
    await validateRegistration(page, eventId!);
  });
});
