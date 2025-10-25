import { EventDto } from '@eventuras/event-sdk';
import { Debug } from '@eventuras/logger';
import { chromium, expect, Page, test as setup } from '@playwright/test';

const debug = Debug.create('e2e');
import fs from 'fs';

import { cleanupOtpEmails, fetchLoginCode } from './utils';

// Get backend API URL from environment (required)
const BACKEND_API_URL = process.env.EVENTURAS_TEST_EVENTS_API_BASE_URL;
if (!BACKEND_API_URL) {
  throw new Error('EVENTURAS_TEST_EVENTS_API_BASE_URL environment variable is required');
}

/**
 * Fetch event details directly from the backend API
 * @param eventId - The event ID to fetch
 * @returns EventDto from the API
 */
export const getEventFromApi = async (eventId: string): Promise<EventDto> => {
  debug('Fetching event %s from API: %s', eventId, BACKEND_API_URL);
  const response = await fetch(`${BACKEND_API_URL}/v3/events/${eventId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch event ${eventId}: ${response.status} ${response.statusText}`);
  }
  
  const event = (await response.json()) as EventDto;
  debug('Successfully fetched event: %s', event.title);
  return event;
};

type CreatedEvent = {
  eventId: string;
};
export const readCreatedEvent = (): CreatedEvent => {
  let createdEvent: CreatedEvent = { eventId: '-1' };
  try {
    createdEvent = JSON.parse(fs.readFileSync('./playwright-e2e/createdEvent.json', 'utf8'));
  } catch (e: any) {
    debug('readCreatedEvent: cant read createdEvent.json');
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
    // Clean up any old OTP emails before starting authentication
    debug('authenticate: cleaning up old OTP emails for %s', userName);
    const cleanedCount = await cleanupOtpEmails(userName);
    debug('authenticate: cleaned up %d old OTP emails', cleanedCount);

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('[data-testid="login-button"]').click();
    await page.locator('[id="username"]').fill(userName);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    debug('authenticate: attempting to fetch login code');
    const loginCode = await fetchLoginCode(userName);
    await page.locator('[id="code"]').fill(loginCode!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    debug('authenticate: filled and clicked continue, waiting for root url');

    await page.waitForURL('/');

    await page.goto('/user');
    await page.waitForLoadState('networkidle');
    debug('authenticate: expect username to be visible upon login and visiting /user');

    await expect(page.getByText(userName).first()).toBeVisible();
    await context.storageState({ path: authFile });
    debug('Auth Complete');
  });
};

export const checkIfLoggedIn = async (page: Page) => {
  await page.goto('/user');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-testid="logged-in-menu-button"]')).toBeVisible();
};

export const logout = async (page: Page) => {
  debug('Logging out user');
  await page.goto('/api/logout');
  await page.waitForLoadState('networkidle');
  debug('User logged out, redirected to homepage');
};

export const checkIfUnAuthorized = async (page: Page, url: string) => {
  await page.goto(url);
  const location = `/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`;
  await page.waitForURL(location);
  return expect(page).toHaveURL(location);
};

export const checkIfAccessToAdmin = async (page: Page) => {
  debug('admin access check');
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-testid="add-event-button"]')).toBeVisible();
};

export const createEvent = async (page: Page, eventName: string) => {
  debug('create simple event: %s', eventName);
  await page.goto('/admin');
  await page.waitForLoadState('load');
  // Create event with only title before being forwarded to the edit page (automatically)
  await page.locator('[data-testid="add-event-button"]').click();
  await page.locator('[data-testid="event-title-input"]').click();
  await page.locator('[data-testid="event-title-input"]').fill(eventName);
  await page.locator('[data-testid="create-event-submit-button"]').click();
  await page.waitForURL('**/admin/events/**');

  // Fill in overview details
  await page.locator('[data-testid="tab-overview"]').click();
  await page.locator('[data-testid="event-status-select-button"]').click();
  await page.getByRole('option', { name: 'RegistrationsOpen' }).click();
  await page.locator('[name="headline"]').fill(`${eventName} headline`);
  await page.locator('[name="category"]').fill(`${eventName} category`);
  await page.locator('[name="maxParticipants"]').fill(`20`);
  await page.locator('[name="featuredImageUrl"]').fill(`https://picsum.photos/500/500`);
  await page.locator('[name="featuredImageCaption"]').fill(`This is a picsum image`);

  // Fill in dates and location
  await page.locator('[data-testid="tab-dates"]').click();
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
  await page.locator('[data-testid="tab-descriptions"]').click();
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
  await page.locator('[data-testid="tab-certificate"]').click();
  await page.locator('[name="certificateTitle"]').fill(`${eventName} certificateTitle`);
  await page.locator('[name="certificateDescription"]').fill(`${eventName} certificateDescription`);

  //Fill Advanced Tab
  await page.locator('[data-testid="tab-advanced"]').click();
  await page.waitForLoadState('networkidle');

  const eventId = await page.locator('[data-testid="eventeditor-form-eventid"]').inputValue();
  debug('Event id from test: %s', eventId);
  
  // Try to click the Save button to save all changes
  debug('Looking for Save button...');
  const saveButton = page.locator('[data-testid="event-save-button"]');
  
  try {
    await saveButton.waitFor({ state: 'visible', timeout: 3000 });
    debug('Save button found, clicking...');
    await saveButton.click();
    
    // Wait for save confirmation
    const toastAppeared = await page.locator('text=Changes saved')
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    
    if (toastAppeared) {
      debug('✅ Save confirmed via toast');
      await page.waitForTimeout(1000);
    } else {
      debug('⚠️  No toast appeared, waiting longer for save...');
      await page.waitForTimeout(3000);
    }
  } catch {
    debug('⚠️  Save button not found, waiting for auto-save...');
    // Give auto-save extra time to work
    await page.waitForTimeout(5000);
  }
  
  await page.waitForLoadState('networkidle');
  
  // Fetch the event directly from the backend API to validate
  debug('Fetching event from API to validate submission...');
  const jsonResponse = await getEventFromApi(eventId);
  
  // Log the full response for debugging
  debug('Full API response: %O', jsonResponse);
  
  // Check if event was actually saved by verifying status
  if (jsonResponse.status === 'Draft') {
    debug('⚠️  WARNING: Event is still in Draft status - fields may not have been saved!');
  }
  
  // Only validate if fields are actually saved (not null)
  const hasData = jsonResponse.description || jsonResponse.city || (jsonResponse.maxParticipants ?? 0) > 0;
  
  if (!hasData) {
    debug('❌ CRITICAL: Event fields were NOT saved! All fields are NULL.');
    debug('This will cause the public event page to fail.');
    throw new Error('Event data not saved - cannot proceed with test');
  }
  
  debug('✅ Event data verified as saved');
  return eventId;
};

export const addProductToEvent = async (page: Page, eventId: string) => {
  // Navigate to the event page if not already there
  debug('Navigating to event page for adding products...');
  await page.goto(`/admin/events/${eventId}?tab=products`);
  await page.waitForLoadState('load');
  
  // Click add product button
  debug('Clicking add product button...');
  await page.locator('[data-testid="add-product-button"]').click();
  
  // Wait for modal to open
  await page.waitForSelector('[data-testid="product-name-input"]', { state: 'visible' });
  
  debug('Filling product form...');
  await page.locator('[data-testid="product-name-input"]').fill(`testname product for ${eventId}`);
  await page
    .locator('[data-testid="product-description-input"]')
    .fill(`test description - this is a description for product for ${eventId}`);
  await page.locator('[data-testid="product-price-input"]').fill('10');
  await page.locator('[data-testid="product-vat-input"]').fill('10');
  
  // Click submit and wait for the modal to close and product to be created
  debug('Submitting product...');
  await Promise.all([
    page.waitForSelector('[data-testid="product-name-input"]', { state: 'hidden', timeout: 10000 }),
    page.locator('[type="submit"]').click(),
  ]);
  
  // Wait for the product to appear in the table
  debug('Waiting for product to appear in table...');
  await expect(page.locator('[data-testid="edit-product-button"]')).toBeVisible({ timeout: 10000 });
  debug('✅ Product added successfully');
};

export const visitAndClickEventRegistrationButton = async (page: Page, eventId: string) => {
  await page.goto(`/events/${eventId}`);
  await page.waitForLoadState('load');
  await page.locator('[data-testid="event-registration-button"]').click();
  debug('Reg button clicked, waiting for registration page');
};

export const fillOutPaymentDetails = async (page: Page) => {
  debug('Filling payment details...');
  await page.locator('[data-testid="registration-zipcode-input"]').click();
  await page.locator('[data-testid="registration-zipcode-input"]').fill('12345BC');
  await page.locator('[data-testid="registration-city-input"]').click();
  await page.locator('[data-testid="registration-city-input"]').fill('Amsterdam');
  await page.locator('[data-testid="registration-country-input"]').click();
  await page.locator('[data-testid="registration-country-input"]').fill('The Netherlands');
  debug('Payment details filled');
  
  // Click the submit button to proceed to confirmation step
  debug('Clicking payment submit button...');
  const paymentSubmitButton = page.locator('[data-testid="registration-payment-submit-button"]');
  await expect(paymentSubmitButton).toBeVisible();
  await paymentSubmitButton.click();
  debug('✅ Payment form submitted');
  
  // Wait for navigation to confirmation step
  await page.waitForLoadState('networkidle');
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
  debug('Registration page reached');
  
  debug('Confirm current account details');
  await page.locator('[data-testid="accounteditor-form-givenname"]').fill('Test');
  await page.locator('[data-testid="accounteditor-form-familyname"]').fill('Test');
  
  // Fill phone number
  debug('Filling phone number...');
  const phoneInput = page.getByRole('textbox', { name: 'Enter phone number' });
  await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
  await phoneInput.fill('12345678');
  
  // Click update button
  debug('Clicking account update button...');
  const updateButton = page.locator('[data-testid="account-update-button"]');
  await expect(updateButton).toBeVisible();
  await updateButton.click();
  
  // Wait for the update to complete (server action)
  debug('Waiting for account update to complete...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Give server action time to complete
  debug('✅ Account details updated');

  debug('Customize product for event: %s', eventId);
  await page.waitForLoadState('networkidle');

  // Select product checkboxes by looking for checkboxes with IDs starting with "checkbox-product-"
  const productCheckbox = page.locator('input[type="checkbox"][id^="checkbox-product-"]');
  await productCheckbox.first().waitFor({ state: 'visible', timeout: 10000 });
  await productCheckbox.first().click();
  debug('Product checkbox clicked');

  const submitButton = page.locator('[data-testid="registration-customize-submit-button"]');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  debug('Registration customize submit button clicked');

  await fillOutPaymentDetails(page);
  
  debug('Clicking registration confirmation button...');
  await page.locator('[data-testid="registration-confirmation-button"]').click();
  
  // Wait for registration to complete (server action)
  await page.waitForLoadState('networkidle');
  debug('✅ Registration submitted');
};

export const visitRegistrationPageForEvent = async (page: Page, eventId: string) => {
  await page.goto(`/user/events/${eventId}`);
  await page.waitForLoadState('load');
};

export const validateRegistration = async (page: Page, eventId: string) => {
  debug('Registered for event, validating...');
  await visitRegistrationPageForEvent(page, eventId);

  // Get the registration tab
  const tab = await page.locator('[data-key="tab-registration"]');
  await tab.click();

  await expect(page.locator('[data-testid="registration-registrationId"]')).toBeVisible();
};

export const editRegistrationOrders = async (page: Page, eventId: string) => {
  await visitRegistrationPageForEvent(page, eventId);
  await page.locator('[data-testid="edit-registration-button"]').click();

  // Select product checkbox by ID pattern
  await page.locator('input[type="checkbox"][id^="checkbox-product-"]').first().click();

  await page.locator('[data-testid="registration-customize-submit-button"]').click();
  await fillOutPaymentDetails(page);

  debug('Confirming registration edit...');
  await page.locator('[data-testid="registration-confirmation-button"]').click();
  
  // Wait for update to complete (server action)
  await page.waitForLoadState('networkidle');
  debug('✅ Registration updated');
};
