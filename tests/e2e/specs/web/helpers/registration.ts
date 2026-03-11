import { Debug } from '@eventuras/logger';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const debug = Debug.create('e2e:registration');

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

  // Wait for confirmation button to appear (indicates navigation to confirmation step)
  await page.locator('[data-testid="registration-confirmation-button"]').waitFor({ state: 'visible', timeout: 15000 });
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

  // Wait for either the account validation step OR the already-registered view
  const givenNameInput = page.locator('[data-testid="accounteditor-form-givenname"]');
  const registrationView = page.locator('[data-testid="registrationview-registration-tab"]');
  await expect(givenNameInput.or(registrationView)).toBeVisible({ timeout: 15000 });

  if (await registrationView.isVisible()) {
    debug('✅ User is already registered for event %s, skipping registration flow', eventId);
    return;
  }

  debug('Confirm current account details');
  await givenNameInput.fill('Test');
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

  // Wait for the account update to complete by waiting for the product section to appear
  debug('Waiting for product selection step to appear...');
  const productCheckbox = page.locator('input[type="checkbox"][id^="checkbox-product-"]');
  await productCheckbox.first().waitFor({ state: 'visible', timeout: 15000 });
  debug('✅ Account details updated, product selection ready');

  debug('Customize product for event: %s', eventId);
  await productCheckbox.first().click();
  debug('Product checkbox clicked');

  const submitButton = page.locator('[data-testid="registration-customize-submit-button"]');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  debug('Registration customize submit button clicked');

  await fillOutPaymentDetails(page);

  debug('Clicking registration confirmation button...');
  await page.locator('[data-testid="registration-confirmation-button"]').click();

  // Wait for registration to complete by waiting for redirect to /user/events page
  await page.waitForURL(`/user/events/${eventId}`, { timeout: 10000 });
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

  // Wait for update to complete by waiting for redirect back to event page
  await page.waitForURL(`/user/events/*`, { timeout: 30000 });
  debug('✅ Registration updated');
};
