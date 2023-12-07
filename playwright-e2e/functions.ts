import { expect, Page } from '@playwright/test';

import Logger from '@/utils/Logger';
const ns = { namespace: 'e2e' };

export const checkIfAccessToAdmin = async (page: Page) => {
  Logger.info({ namespace: 'testing' }, 'admin access check');
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-test-id="add-event-button"]')).toBeVisible();
};

export const createEvent = async (page: Page, eventName: string) => {
  // page is authenticated
  Logger.info(ns, 'create simple event', eventName);
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await page.locator('[data-test-id="add-event-button"]').click();
  await page.locator('[data-test-id="event-title-input"]').click();
  await page.locator('[data-test-id="event-title-input"]').fill(eventName);
  await page.locator('[data-test-id="create-event-submit-button"]').click();
  await expect(page.locator('[data-test-id="notification-success"]')).toBeVisible();
  await page.waitForURL('**/edit');

  const editForm = page.locator('[data-test-id="event-edit-form"]');
  const eventId = await editForm.getAttribute('data-event-id');
  Logger.info(ns, `Event created ${eventId}`);
  await page.locator('[data-test-id="event-status-select"]').click();
  await page.locator('[data-test-id="RegistrationsOpen"]').click();
  await page.locator('[data-test-id="event-published-checkbox"]').click();
  await page.getByRole('button', { name: 'Submit' }).click();
  return eventId!;
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  await page.goto(`admin/events/${eventId}/products`);
  await page.locator('[data-test-id="add-product-button"]').click();
  await page.locator('[data-test-id="product-name-input"]').fill(`testname product for ${eventId}`);
  await page
    .locator('[data-test-id="product-description-input"]')
    .fill(`test description - this is a description for product for ${eventId}`);

  await page
    .locator('[data-test-id="product-additional-input"]')
    .fill(`additional information for ${eventId}`);
  await page.locator('[data-test-id="product-price-input"]').fill('10');
  await page.locator('[data-test-id="product-vat-input"]').fill('10');
  await page.locator('[type="submit"]').click();
  await expect(page.locator('[data-test-id="edit-product-button"]')).toBeVisible();
};

export const registerForEvent = async (page: Page, eventId: string) => {
  Logger.info(ns, 'register for event', eventId);
  await page.goto(`/events/${eventId}`);
  await page.waitForLoadState('load');
  await page.locator('[data-test-id="event-registration-button"]').click();
  Logger.info(ns, 'Reg button clicked, waiting for registration page');
  await page.waitForURL(`/user/events/${eventId}/registration`);
  Logger.info(ns, 'Registration page reached');
  await page.locator('[data-test-id="product-selection-checkbox"]').click();
  Logger.info(ns, 'Product checkbox clicked');
  const submitButton = await page.locator('[data-test-id="registration-customize-submit-button"]');
  expect(submitButton.isEnabled());
  await submitButton.click();
  Logger.info(ns, 'Registration customize submit button clicked');
  await page.locator('[data-test-id="registration-zipcode-input"]').click();
  await page.locator('[data-test-id="registration-zipcode-input"]').fill('12345BC');
  await page.locator('[data-test-id="registration-city-input"]').click();
  await page.locator('[data-test-id="registration-city-input"]').fill('Amsterdam');
  await page.locator('[data-test-id="registration-country-input"]').click();
  await page.locator('[data-test-id="registration-country-input"]').fill('The Netherlands');
  await page.locator('[data-test-id="registration-payment-submit-button"]').click();
  await page.locator('[data-test-id="registration-complete-submit-button"]').click();
  await expect(page.locator('[data-test-id="registration-complete-confirmation"]')).toBeVisible();
};

export const validateRegistration = async (page: Page, eventId: string) => {
  Logger.info(ns, 'Registered for event, validating..');
  await page.goto(`/user`);
  await page.waitForLoadState('load');
  const clickToUserEventPage = await page.locator(`[data-test-id="${eventId}"]`);
  const userEventUrl = await clickToUserEventPage.getAttribute('href');
  await clickToUserEventPage.click();
  await page.waitForURL(userEventUrl!);
  await page.waitForLoadState('load');
  const clickToUserRegistrationPage = await page.locator(`[data-test-id="registration-page-link"]`);
  const userRegistrationUrl = await clickToUserRegistrationPage.getAttribute('href');
  await clickToUserRegistrationPage.click();
  await page.waitForURL(userRegistrationUrl!);
  await page.waitForLoadState('load');
  await expect(page.locator('[data-test-id="registration-id-container"]')).toBeVisible();
  Logger.info(
    ns,
    'Registration succesful, now making sure products were also registered correctly'
  );
  await expect(page.locator('[data-test-id="product-container"]')).toBeVisible();
};
