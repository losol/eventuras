const ns = { namespace: 'e2e' };
import { chromium, expect, Page, test as setup } from '@playwright/test';

import Logger from '@/utils/Logger';

import { fetchLoginCode } from './utils';

export const authenticate = async (userName: string, authFile: string) => {
  setup.use({
    locale: 'en-GB',
    timezoneId: 'Europe/Berlin',
  });
  setup('authenticate', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('[data-test-id="login-button"]').click();
    await page.locator('[id="username"]').fill(userName);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    const loginCode = await fetchLoginCode(userName);
    await page.locator('[id="code"]').fill(loginCode!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.waitForURL('/');

    await page.goto('/user');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(userName).first()).toBeVisible();
    await context.storageState({ path: authFile });
    Logger.info({ namespace: 'testing.auth' }, 'Auth Complete');
  });
};

export const checkIfLoggedIn = async (page: Page) => {
  await page.goto('/user');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-test-id="logged-in-menu-button"]')).toBeVisible();
};

export const checkIfUnAuthorized = async (page: Page, url: string) => {
  await page.goto(url);
  const location = `/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`;
  await page.waitForURL(location);
  return expect(page).toHaveURL(location);
};

export const checkIfAccessToAdmin = async (page: Page) => {
  Logger.info({ namespace: 'testing' }, 'admin access check');
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-test-id="add-event-button"]')).toBeVisible();
};

export const createEvent = async (page: Page, eventName: string) => {
  Logger.info(ns, 'create simple event', eventName);
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await page.locator('[data-test-id="add-event-button"]').click();
  await page.locator('[data-test-id="event-title-input"]').click();
  await page.locator('[data-test-id="event-title-input"]').fill(eventName);
  await page.locator('[data-test-id="create-event-submit-button"]').click();
  await expect(page.locator('[data-test-id="notification-success"]')).toBeVisible();
  await page.waitForURL('**/edit');

  await page.locator('[data-test-id="event-status-select-button"]').click();

  await page.getByRole('option', { name: 'RegistrationsOpen' }).click();
  await page.locator('[data-test-id="event-published-checkbox"]').click();

  const advancedTab = page.getByRole('tab', { name: 'Advanced' });
  advancedTab.click();

  const eventId = await page.locator('[data-test-id="eventeditor-form-eventid"]').inputValue();
  Logger.info(ns, `Event id from test: ${eventId}`);

  await page.locator('[type=submit]').click();
  return eventId;
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  await page.goto(`admin/events/${eventId}/products/edit`);
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

export const visitAndClickEventRegistrationButton = async (page: Page, eventId: string) => {
  await page.goto(`/events/${eventId}`);
  await page.waitForLoadState('load');
  await page.locator('[data-test-id="event-registration-button"]').click();
  Logger.info(ns, 'Reg button clicked, waiting for registration page');
};

export const registerForEvent = async (
  page: Page,
  eventId: string,
  startFromHome: boolean = true
) => {
  if (startFromHome) {
    await visitAndClickEventRegistrationButton(page, eventId);
  }
  await page.waitForURL(`/user/events/${eventId}/registration`);
  Logger.info(ns, 'Registration page reached');
  Logger.info(ns, 'register for event', eventId);
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
  await expect(page.locator('[data-test-id="registration-account-step"]')).toBeVisible();
  await page.locator('[data-test-id="accounteditor-form-phonenumber"]').fill('+4712345678');
  await page.locator('[data-test-id="account-update-button"]').click();

  await page.locator('[data-test-id="registration-complete-submit-button"]').click();
};

export const visitRegistrationPageForEvent = async (page: Page, eventId: string) => {
  await page.goto(`/user/events/${eventId}`);
  const clickToUserRegistrationPage = await page.locator(`[data-test-id="registration-page-link"]`);
  const userRegistrationUrl = await clickToUserRegistrationPage.getAttribute('href');
  await clickToUserRegistrationPage.click();
  await page.waitForURL(userRegistrationUrl!);
  await page.waitForLoadState('load');
};

export const validateRegistration = async (page: Page, eventId: string) => {
  Logger.info(ns, 'Registered for event, validating..');
  await visitRegistrationPageForEvent(page, eventId);
  await expect(page.locator('[data-test-id="registration-id-container"]')).toBeVisible();
  Logger.info(
    ns,
    'Registration succesful, now making sure products were also registered correctly'
  );
  await expect(page.locator('[data-test-id="product-container"]')).toBeVisible();
};

export const editRegistrationOrders = async (page: Page, eventId: string) => {
  await visitRegistrationPageForEvent(page, eventId);
  await page.locator('[data-test-id="edit-orders-button"]').click();
  expect(page.locator('[data-test-id="edit-orders-dialog"]')).toBeVisible();
  await page.locator('[data-test-id="product-selection-checkbox"]').first().click();
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/products') && resp.status() === 200),
    page.locator('[data-test-id="registration-customize-submit-button"]').click(),
    expect(page.locator('[data-test-id="notification-success"]')).toBeVisible(),
  ]);
};
