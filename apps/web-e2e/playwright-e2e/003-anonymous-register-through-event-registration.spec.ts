import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';

import {
  readCreatedEvent,
  registerForEvent,
  validateRegistration,
  visitAndClickEventRegistrationButton,
} from './functions';
import { fetchLoginCode, parseEmailAlias } from './utils';

dotenv.config();

test.describe.configure({ mode: 'serial' });

const adminTestMail = process.env.TEST_EMAIL_ADMIN_USER!;
const tagAndNs = parseEmailAlias(adminTestMail);
if (!tagAndNs) {
  throw new Error('Could not extract namespace from email');
}

// Extract the domain from the admin email
const [, domain] = adminTestMail.split('@');

// Use plus addressing for the new user email
const userName = `${tagAndNs.nameSpace}+newuser-${Math.floor(Date.now() / 1000 / 10)}@${domain}`;

test.describe('should be able to register as an anonymous user when hitting the event registration page', () => {
  const createdEvent = readCreatedEvent();

  test('registration button should be visible for anonymous users', async ({ page }) => {
    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    const url = `/user/events/${createdEvent.eventId}`;
    const location = `/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`;
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(location);
  });

  test('should be able to register user through the event registration page', async ({ page }) => {
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
