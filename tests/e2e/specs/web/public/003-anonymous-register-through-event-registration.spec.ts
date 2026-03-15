/* eslint no-process-env: 0 */

import { expect, test } from '@playwright/test';

import { readCreatedEvent } from '../helpers/event';
import {
  registerForEvent,
  validateRegistration,
  visitAndClickEventRegistrationButton,
} from '../helpers/registration';
import { cleanupOtpEmails, fetchLoginCode } from '../../shared/utils';

test.describe.configure({ mode: 'serial' });

// Generate a unique test email using Gmail's plus addressing feature
// This allows using a single Gmail account for multiple test identities
const baseEmail = process.env.E2E_BASE_EMAIL;
if (!baseEmail) {
  throw new Error('E2E_BASE_EMAIL must be set');
}

// Extract the local part and domain from the base email
const [localPart, domain] = baseEmail.split('@');
// Create a unique identifier for this test run
const timestamp = Math.floor(Date.now() / 1000 / 10);
// Use Gmail's plus addressing: localpart+tag@domain.com
const userName = `${localPart}+newuser-${timestamp}@${domain}`;

test.describe('should be able to register as an anonymous user when hitting the event registration page', () => {
  let createdEvent: ReturnType<typeof readCreatedEvent>;

  test.beforeAll(() => {
    createdEvent = readCreatedEvent();
  });

  test('registration button should redirect anonymous users to login', async ({ page }) => {
    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    // Should be redirected away from the public event page to the identity provider
    const publicEventUrl = `/events/${createdEvent.eventId}`;
    await page.waitForURL((url) => !url.pathname.startsWith(publicEventUrl), { timeout: 15000 });
    // Verify we were redirected away (the exact URL depends on the IdP)
    expect(page.url()).not.toContain(publicEventUrl);
  });

  test('should be able to register user through the even registration page', async ({ page }) => {
    // Clean up any old OTP emails before starting
    await cleanupOtpEmails(userName);

    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    // Wait for Auth0 login page to load
    await page.waitForLoadState();
    await page.getByRole('link', { name: 'Sign up' }).click();
    await page.waitForLoadState();
    await page.locator('[id="email"]').fill(userName);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const registrationCode = await fetchLoginCode(userName);
    await page.locator('[id="code"]').fill(registrationCode!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForLoadState();

    // Auth0 consent screen may or may not appear depending on configuration
    const acceptButton = page.getByRole('button', { name: 'Accept', exact: true });
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptButton.click();
      await page.waitForLoadState();
    }

    await registerForEvent(page, createdEvent.eventId, false);
    await validateRegistration(page, createdEvent.eventId);
  });
});
