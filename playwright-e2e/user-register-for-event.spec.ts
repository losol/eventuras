/* eslint no-process-env: 0 */

import { test } from '@playwright/test';

import Logger from '@/utils/Logger';

import { registerForEvent, validateRegistration } from './functions';

test.describe.configure({ mode: 'serial' });
const eventId: string | undefined = process.env.TEST_EVENT_ID;

test.describe('register for event', () => {
  test.beforeAll(() => {
    if (!eventId) {
      Logger.error(
        { namespace: 'e2e' },
        'You need to specify TEST_EVENT_ID to test against in your environment'
      );
    }
  });

  test('register for event', async ({ page }) => {
    await registerForEvent(page, eventId!);
  });

  test('validate event registration', async ({ page }) => {
    await validateRegistration(page, eventId!);
  });
});
