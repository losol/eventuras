import { expect, test } from '@playwright/test';

import { submitTesseraOtpLogin } from '../helpers/auth';
import { readCreatedEvent } from '../helpers/event';
import {
  registerForEvent,
  validateRegistration,
  visitAndClickEventRegistrationButton,
} from '../helpers/registration';
import { cleanupOtpEmails } from '../../../utils/otp';
import { newRegularEmail } from '../../../utils/personas';

test.describe.configure({ mode: 'serial' });

test.describe('should be able to register as an anonymous user when hitting the event registration page', () => {
  let createdEvent: ReturnType<typeof readCreatedEvent>;

  test.beforeAll(() => {
    createdEvent = readCreatedEvent();
  });

  test('registration button should redirect anonymous users to login', async ({ page }) => {
    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    // Should be redirected away from the public event page to the identity provider
    const publicEventUrl = `/events/${createdEvent.eventId}`;
    await page.waitForURL(url => !url.pathname.startsWith(publicEventUrl), { timeout: 15000 });
    // Verify we were redirected away (the exact URL depends on the IdP)
    expect(page.url()).not.toContain(publicEventUrl);
  });

  test('should be able to register user through the even registration page', async ({ page }) => {
    // Generate inside the test so each retry signs up a fresh user (a reused
    // address would hit "user already exists" instead of the sign-up flow).
    const userName = newRegularEmail();
    // Clean up any old OTP emails before starting
    await cleanupOtpEmails(userName);

    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    // The anonymous click redirects to the tessera-otp login; a brand-new email
    // is auto-created on first OTP login (the realm has no self-registration).
    await submitTesseraOtpLogin(page, userName);

    await registerForEvent(page, createdEvent.eventId, false);
    await validateRegistration(page, createdEvent.eventId);
  });
});
