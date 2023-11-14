/* eslint no-process-env: 0 */

import { expect, Page, test } from '@playwright/test';

import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

test.describe.configure({ mode: 'serial' });
const eventName = `This is a playwright event - ${Math.floor(Date.now() / 1000 / 10)}`;
const eventSlug = slugify(eventName);
let eventId: string | null;

const checkIfAccessToAdmin = async (page: Page) => {
  Logger.info({ namespace: 'testing' }, 'admin access check', eventName);
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-test-id="add-event-button"]')).toBeVisible();
};

const createSimpleEvent = async (page: Page) => {
  // page is authenticated
  Logger.info({ namespace: 'testing' }, 'create simple event', eventName);
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await page.locator('[data-test-id="add-event-button"]').click();
  await page.locator('[data-test-id="event-title-input"]').click();
  await page.locator('[data-test-id="event-title-input"]').fill(eventName);
  await page.locator('[data-test-id="create-event-submit-button"]').click();
  await expect(page.locator('[data-test-id="notification-success"]')).toBeVisible();
  await page.waitForURL('**/edit');

  const editForm = page.locator('[data-test-id="event-edit-form"]');
  eventId = await editForm.getAttribute('data-event-id');

  await page.locator('[data-test-id="event-status-select"]').click();
  await page.locator('[data-test-id="RegistrationsOpen"]').click();
  await page.locator('[data-test-id="event-published-checkbox"]').click();
  await page.getByRole('button', { name: 'Submit' }).click();
};

const registerForEvent = async (page: Page, eventId: string) => {
  Logger.info({ namespace: 'testing' }, 'register for event', eventName);
  await page.goto(`/events/${eventId}/${eventSlug}`);
  await page.waitForLoadState('load');
  await page.locator('[data-test-id="event-registration-button"]').click();
  await page.locator('[data-test-id="registration-customize-submit-button"]').click();
  await page.locator('[data-test-id="registration-zipcode-input"]').click();
  await page.locator('[data-test-id="registration-zipcode-input"]').fill('12345BC');
  await page.locator('[data-test-id="registration-city-input"]').click();
  await page.locator('[data-test-id="registration-city-input"]').fill('Amsterdam');
  await page.locator('[data-test-id="registration-country-input"]').click();
  await page.locator('[data-test-id="registration-country-input"]').fill('The Netherlands');
  await page.locator('[data-test-id="registration-payment-submit-button"]').click();
  await page.locator('[data-test-id="registration-complete-submit-button"]').click();
  await page.goto(`/events/${eventId}/${eventSlug}`);
  await page.locator('[data-test-id="event-registration-button"]').click();
  await expect(page.locator('[data-test-id="already-registered-text"]')).toBeVisible();
};

test.describe('create event and register for it', () => {
  test('admin check', async ({ page }) => {
    await checkIfAccessToAdmin(page);
  });
  test('create simple event', async ({ page }) => {
    await createSimpleEvent(page);
  });

  test('register for event', async ({ page }) => {
    await registerForEvent(page, eventId!);
  });
});
