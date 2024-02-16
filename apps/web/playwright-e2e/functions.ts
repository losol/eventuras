const ns = { namespace: 'e2e' };
import { chromium, expect, Page, test as setup } from '@playwright/test';
import fs from 'fs';

import Logger from '@/utils/Logger';

import { fetchLoginCode } from './utils';
type CreatedEvent = {
  eventId: string;
};
export const readCreatedEvent = (): CreatedEvent => {
  let createdEvent: CreatedEvent = { eventId: '-1' };
  try {
    createdEvent = JSON.parse(fs.readFileSync('./playwright-e2e/createdEvent.json', 'utf8'));
  } catch (e: any) {}
  return createdEvent;
};

export const writeCreatedEvent = (eventId: string) => {
  const eventToStore = JSON.stringify({ eventId });
  fs.writeFileSync('./playwright-e2e/createdEvent.json', eventToStore);
};
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
    Logger.info(ns, 'authenticate: attempting to fetch login code');
    const loginCode = await fetchLoginCode(userName);
    await page.locator('[id="code"]').fill(loginCode!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    Logger.info(ns, 'authenticate: filled and clicked continue, waiting for root url');

    await page.waitForURL('/');

    await page.goto('/user');
    await page.waitForLoadState('networkidle');
    Logger.info(ns, 'authenticate: expect username to be visible upon login and visiting /user');

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
  Logger.info(ns, 'admin access check');
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

  await page.getByRole('tab', { name: 'Advanced' }).click();

  const eventId = await page.locator('[data-test-id="eventeditor-form-eventid"]').inputValue();
  Logger.info(ns, `Event id from test: ${eventId}`);

  await page.locator('[type=submit]').click();
  return eventId;
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  await page.goto(`admin/events/${eventId}/products`);
  await page.locator('[data-test-id="add-product-button"]').click();
  await page.locator('[data-test-id="product-name-input"]').fill(`testname product for ${eventId}`);
  await page
    .locator('[data-test-id="product-description-input"]')
    .fill(`test description - this is a description for product for ${eventId}`);
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

export const fillOutPaymentDetails = async (page: Page) => {
  await page.locator('[data-test-id="registration-zipcode-input"]').click();
  await page.locator('[data-test-id="registration-zipcode-input"]').fill('12345BC');
  await page.locator('[data-test-id="registration-city-input"]').click();
  await page.locator('[data-test-id="registration-city-input"]').fill('Amsterdam');
  await page.locator('[data-test-id="registration-country-input"]').click();
  await page.locator('[data-test-id="registration-country-input"]').fill('The Netherlands');
  Logger.info(ns, 'Payment submit button clicked');

  return page.locator('[data-test-id="registration-payment-submit-button"]').click();
};

export const registerForEvent = async (
  page: Page,
  eventId: string,
  startFromHome: boolean = true
) => {
  if (startFromHome) {
    await visitAndClickEventRegistrationButton(page, eventId);
  }
  await page.waitForURL(`/user/events/${eventId}`);
  Logger.info(ns, 'Registration page reached');
  Logger.info(ns, 'Confirm current account details');
  await page.locator('[data-test-id="accounteditor-form-givenname"]').fill('Test');
  await page.locator('[data-test-id="accounteditor-form-familyname"]').fill('Test');
  await page.locator('[data-test-id="accounteditor-form-phonenumber"]').fill('+4712345678');
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('userprofile') && resp.status() === 200),
    page.locator('[data-test-id="account-update-button"]').click(),
  ]);
  Logger.info(ns, 'Customize product', eventId);
  await page.locator('[data-test-id="product-selection-checkbox"]').click();
  Logger.info(ns, 'Product checkbox clicked');
  const submitButton = await page.locator('[data-test-id="registration-customize-submit-button"]');
  expect(submitButton.isEnabled());
  await submitButton.click();
  Logger.info(ns, 'Registration customize submit button clicked');
  await fillOutPaymentDetails(page);
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('registrations') && resp.status() === 200),
    page.waitForResponse(resp => resp.url().includes('products') && resp.status() === 200),
    page.locator('[data-test-id="registration-confirmation-button"]').click(),
  ]);
};

export const visitRegistrationPageForEvent = async (page: Page, eventId: string) => {
  await page.goto(`/user/events/${eventId}`);
  await page.waitForLoadState('load');
};

export const validateRegistration = async (page: Page, eventId: string) => {
  Logger.info(ns, 'Registered for event, validating..');
  await visitRegistrationPageForEvent(page, eventId);
  await expect(page.locator('[data-test-id="registration-registrationId"]')).toBeVisible();
};

export const editRegistrationOrders = async (page: Page, eventId: string) => {
  await visitRegistrationPageForEvent(page, eventId);
  await page.locator('[data-test-id="edit-registration-button"]').click();
  await page.locator('[data-test-id="product-selection-checkbox"]').first().click();
  await page.locator('[data-test-id="registration-customize-submit-button"]').click();
  await fillOutPaymentDetails(page);

  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('registrations') && resp.status() === 200),
    page.waitForResponse(resp => resp.url().includes('products') && resp.status() === 200),
    page.locator('[data-test-id="registration-confirmation-button"]').click(),
  ]);
};
