/* eslint no-process-env: 0 */

import { expect, test } from '@playwright/test';

import {
  readCreatedEvent,
  registerForEvent,
  validateRegistration,
  visitAndClickEventRegistrationButton,
} from './functions';
import { cleanupOtpEmails, fetchLoginCode } from './utils';

test.describe.configure({ mode: 'serial' });

// Generate a unique test email using Gmail's plus addressing feature
// This allows using a single Gmail account for multiple test identities
const baseEmail = process.env.EVENTURAS_TEST_BASE_EMAIL;
if (!baseEmail) {
  throw new Error('EVENTURAS_TEST_BASE_EMAIL must be set');
}

// Extract the local part and domain from the base email
const [localPart, domain] = baseEmail.split('@');
// Create a unique identifier for this test run
const timestamp = Math.floor(Date.now() / 1000 / 10);
// Use Gmail's plus addressing: localpart+tag@domain.com
const userName = `${localPart}+newuser-${timestamp}@${domain}`;

test.describe('should be able to register as an anonymous user when hitting the event registration page', () => {
  const createdEvent = readCreatedEvent();
  test('registration button should be visible for anonymous users', async ({ page }) => {
    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    ///api/auth/signin?callbackUrl=%2Fuser%2Fevents%2F6%2Fregistration
    const url = `/user/events/${createdEvent.eventId}`;
    const location = `/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`;
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(location);
  });

  test('should be able to register user through the even registration page', async ({ page }) => {
    // Clean up any old OTP emails before starting
    await cleanupOtpEmails(userName);

    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    await page.locator('[type="submit"]').click();
    await page.waitForLoadState();
    await page.getByRole('link', { name: 'Sign up' }).click();
    await page.waitForLoadState();
    await page.locator('[id="email"]').fill(userName);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const registrationCode = await fetchLoginCode(userName);
    await page.locator('[id="code"]').fill(registrationCode!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForLoadState();
    await page.getByRole('button', { name: 'Accept', exact: true }).click();
    await page.waitForLoadState();
    await registerForEvent(page, createdEvent.eventId, false);
    await validateRegistration(page, createdEvent.eventId);
  });
});
