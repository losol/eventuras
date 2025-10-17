const ns = { namespace: 'e2e' };
import { EventDto } from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';
import { chromium, expect, Page, test as setup } from '@playwright/test';
import fs from 'fs';

import { fetchLoginCode } from './utils';

type CreatedEvent = {
  eventId: string;
};
export const readCreatedEvent = (): CreatedEvent => {
  let createdEvent: CreatedEvent = { eventId: '-1' };
  try {
    createdEvent = JSON.parse(fs.readFileSync('./playwright-e2e/createdEvent.json', 'utf8'));
  } catch (e: any) {
    Logger.error(ns, 'readCreatedEvent: cant ready createdEvent.json');
  }
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
    await page.locator('[data-testid="login-button"]').click();
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
  await expect(page.locator('[data-testid="logged-in-menu-button"]')).toBeVisible();
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
  await expect(page.locator('[data-testid="add-event-button"]')).toBeVisible();
};

export const createEvent = async (page: Page, eventName: string) => {
  Logger.info(ns, 'create simple event', eventName);
  await page.goto('/admin');
  await page.waitForLoadState('load');
  // Create event with only title before being forwarded to the edit page (automatically)
  await page.locator('[data-testid="add-event-button"]').click();
  await page.locator('[data-testid="event-title-input"]').click();
  await page.locator('[data-testid="event-title-input"]').fill(eventName);
  await page.locator('[data-testid="create-event-submit-button"]').click();
  await page.waitForURL('**/edit');

  // Fill in overview details
  await page.locator('[data-testid="event-status-select-button"]').click();
  await page.getByRole('option', { name: 'RegistrationsOpen' }).click();
  await page.locator('[name="headline"]').fill(`${eventName} headline`);
  await page.locator('[name="category"]').fill(`${eventName} category`);
  await page.locator('[name="maxParticipants"]').fill(`20`);
  await page.locator('[name="featuredImageUrl"]').fill(`https://picsum.photos/500/500`);
  await page.locator('[name="featuredImageCaption"]').fill(`This is a picsum image`);

  // Fill in dates and location
  await page.getByRole('tab', { name: 'Dates And location' }).click();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const lastRegistrationDate = new Date(Date.now() + oneWeek * 2);
  const lastCancellationDate = new Date(Date.now() + oneWeek * 3);
  const startDate = new Date(Date.now() + oneWeek * 4);
  const endDate = new Date(Date.now() + oneWeek * 5);
  const formatDate = (d: Date) => {
    const pad = (s: string) => {
      if (s.length === 1) return `0${s}`;
      return s;
    };
    const year = d.getFullYear();
    const month = pad((d.getMonth() + 1).toString());
    const day = pad(d.getDate().toString());

    return `${year}-${month}-${day}`;
  };
  await page.locator('[name="dateStart"]').fill(formatDate(startDate));
  await page.locator('[name="dateEnd"]').fill(formatDate(endDate));
  await page.locator('[name="lastRegistrationDate"]').fill(formatDate(lastRegistrationDate));
  await page.locator('[name="lastCancellationDate"]').fill(formatDate(lastCancellationDate));
  await page.locator('[name="city"]').fill(`${eventName} city`);
  await page.locator('[name="location"]').fill(`${eventName} location`);

  //Fill in Descriptions
  await page.getByRole('tab', { name: 'Descriptions' }).click();
  await page
    .locator('[class="editor-shell"]')
    .filter({ hasText: 'Description' })
    .getByRole('textbox')
    .fill(`${eventName} description`);
  await page
    .locator('[class="editor-shell"]')
    .filter({ hasText: 'Program' })
    .getByRole('textbox')
    .fill(`${eventName} program`);
  await page
    .locator('[class="editor-shell"]')
    .filter({ hasText: 'Practical' })
    .getByRole('textbox')
    .fill(`${eventName} practical information`);
  await page
    .locator('[class="editor-shell"]')
    .filter({ hasText: 'More Information' })
    .getByRole('textbox')
    .fill(`${eventName} more information`);
  await page
    .locator('[class="editor-shell"]')
    .filter({ hasText: 'Welcome Letter' })
    .getByRole('textbox')
    .fill(`${eventName} welcome letter`);
  await page
    .locator('[class="editor-shell"]')
    .filter({ hasText: 'Information Request' })
    .getByRole('textbox')
    .fill(`${eventName} information request`);

  //Fill Certificate Details
  await page.getByRole('tab', { name: 'Certificate' }).click();
  await page.locator('[name="certificateTitle"]').fill(`${eventName} certificateTitle`);
  await page.locator('[name="certificateDescription"]').fill(`${eventName} certificateDescription`);

  //Fill Advanced Tab
  await page.getByRole('tab', { name: 'Advanced' }).click();

  const eventId = await page.locator('[data-testid="eventeditor-form-eventid"]').inputValue();
  Logger.info(ns, `Event id from test: ${eventId}`);
  const eventSubmission = page.waitForResponse(resp => resp.url().includes(`/events/${eventId}`));
  await page.locator('[type=submit]').click();
  const jsonResponse = (await eventSubmission.then(r => r.json())) as EventDto;
  expect(jsonResponse.description!.length).toBeGreaterThan(0);
  expect(jsonResponse.program!.length).toBeGreaterThan(0);
  expect(jsonResponse.practicalInformation!.length).toBeGreaterThan(0);
  expect(jsonResponse.moreInformation!.length).toBeGreaterThan(0);
  expect(jsonResponse.welcomeLetter!.length).toBeGreaterThan(0);
  expect(jsonResponse.informationRequest!.length).toBeGreaterThan(0);
  expect(jsonResponse.category!.length).toBeGreaterThan(0);
  expect(jsonResponse.certificateDescription!.length).toBeGreaterThan(0);
  expect(jsonResponse.city!.length).toBeGreaterThan(0);
  expect(jsonResponse.dateEnd).toBeDefined();
  expect(jsonResponse.dateStart).toBeDefined();
  expect(jsonResponse.maxParticipants!).toEqual(20);
  return eventId;
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  await page.goto(`admin/events/${eventId}/products`);
  await page.locator('[data-testid="add-product-button"]').click();
  await page.locator('[data-testid="product-name-input"]').fill(`testname product for ${eventId}`);
  await page
    .locator('[data-testid="product-description-input"]')
    .fill(`test description - this is a description for product for ${eventId}`);
  await page.locator('[data-testid="product-price-input"]').fill('10');
  await page.locator('[data-testid="product-vat-input"]').fill('10');
  await page.locator('[type="submit"]').click();
  await expect(page.locator('[data-testid="edit-product-button"]')).toBeVisible();
};

export const visitAndClickEventRegistrationButton = async (page: Page, eventId: string) => {
  await page.goto(`/events/${eventId}`);
  await page.waitForLoadState('load');
  await page.locator('[data-testid="event-registration-button"]').click();
  Logger.info(ns, 'Reg button clicked, waiting for registration page');
};

export const fillOutPaymentDetails = async (page: Page) => {
  await page.locator('[data-testid="registration-zipcode-input"]').click();
  await page.locator('[data-testid="registration-zipcode-input"]').fill('12345BC');
  await page.locator('[data-testid="registration-city-input"]').click();
  await page.locator('[data-testid="registration-city-input"]').fill('Amsterdam');
  await page.locator('[data-testid="registration-country-input"]').click();
  await page.locator('[data-testid="registration-country-input"]').fill('The Netherlands');
  Logger.info(ns, 'Payment submit button clicked');

  return page.locator('[data-testid="registration-payment-submit-button"]').click();
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
  await page.locator('[data-testid="accounteditor-form-givenname"]').fill('Test');
  await page.locator('[data-testid="accounteditor-form-familyname"]').fill('Test');
  // getByRole('textbox', { name: 'Enter phone number' })
  await page.getByRole('textbox', { name: 'Enter phone number' }).fill('12345678');
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('userprofile') && resp.status() === 200),
    page.locator('[data-testid="account-update-button"]').click(),
  ]);
  Logger.info(ns, 'Customize product', eventId);
  await page.locator('[data-testid="product-selection-checkbox"]').click();
  Logger.info(ns, 'Product checkbox clicked');
  const submitButton = await page.locator('[data-testid="registration-customize-submit-button"]');
  expect(submitButton.isEnabled());
  await submitButton.click();
  Logger.info(ns, 'Registration customize submit button clicked');
  await fillOutPaymentDetails(page);
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('registrations') && resp.status() === 200),
    page.waitForResponse(resp => resp.url().includes('products') && resp.status() === 200),
    page.locator('[data-testid="registration-confirmation-button"]').click(),
  ]);
};

export const visitRegistrationPageForEvent = async (page: Page, eventId: string) => {
  await page.goto(`/user/events/${eventId}`);
  await page.waitForLoadState('load');
};

export const validateRegistration = async (page: Page, eventId: string) => {
  Logger.info(ns, 'Registered for event, validating..');
  await visitRegistrationPageForEvent(page, eventId);

  // Get the registration tab
  const tab = await page.locator('[data-key="tab-registration"]');
  await tab.click();

  await expect(page.locator('[data-testid="registration-registrationId"]')).toBeVisible();
};

export const editRegistrationOrders = async (page: Page, eventId: string) => {
  await visitRegistrationPageForEvent(page, eventId);
  await page.locator('[data-testid="edit-registration-button"]').click();
  await page.locator('[data-testid="product-selection-checkbox"]').first().click();
  await page.locator('[data-testid="registration-customize-submit-button"]').click();
  await fillOutPaymentDetails(page);

  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('registrations') && resp.status() === 200),
    page.waitForResponse(resp => resp.url().includes('products') && resp.status() === 200),
    page.locator('[data-testid="registration-confirmation-button"]').click(),
  ]);
};
