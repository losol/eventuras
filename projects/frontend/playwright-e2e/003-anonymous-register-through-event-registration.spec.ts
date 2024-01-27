/* eslint no-process-env: 0 */

import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';

import createdEvent from './createdEvent.json';
import {
  registerForEvent,
  validateRegistration,
  visitAndClickEventRegistrationButton,
} from './functions';
import { fetchLoginCode, getTagAndNamespaceFromEmail } from './utils';

dotenv.config();

test.describe.configure({ mode: 'serial' });
const adminTestMail = process.env.TEST_E2E_EMAIL_ADMIN;
const tagAndNs = getTagAndNamespaceFromEmail(adminTestMail!);
const userName = `${tagAndNs.nameSpace}.newuser-${Math.floor(
  Date.now() / 1000 / 10
)}@inbox.testmail.app`;
test.describe('should be able to register as an anonymous user when hitting the event registration page', () => {
  test('registration button should be visible for anonymous users', async ({ page }) => {
    await visitAndClickEventRegistrationButton(page, createdEvent.eventId);
    ///api/auth/signin?callbackUrl=%2Fuser%2Fevents%2F6%2Fregistration
    const url = `/user/events/${createdEvent.eventId}`;
    const location = `/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`;
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(location);
  });

  test('should be able to register user through the even registration page', async ({ page }) => {
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
    await registerForEvent(page, createdEvent.eventId, false);
    await validateRegistration(page, createdEvent.eventId);
  });
});
