import { Logger } from '@eventuras/logger';
import { chromium, expect, test as setup, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { cleanupOtpEmails, fetchLoginCode } from '../../../utils/otp';

const logger = Logger.create({ namespace: 'e2e:auth' });
const isCI = !!process.env.CI;

/**
 * Drives the custom tessera-otp login (keycloak-ratio-theme), assuming the login
 * start page is showing. Fills the email, waits for the ALTCHA challenge to
 * auto-solve into its hidden field (the server rejects the form otherwise),
 * reads the OTP from the inbox, and submits the code. Resolves once the web
 * app's OIDC callback has appended `?login=success`.
 *
 * Shared by the persona setup and the anonymous-registration spec so the IdP
 * selectors live in one place.
 */
export const submitTesseraOtpLogin = async (page: Page, email: string): Promise<void> => {
  // Start page (#kc-email-form): the ALTCHA challenge auto-solves into a hidden
  // field — the server rejects the form unless it's populated, so wait for it.
  await page.locator('#email').fill(email);
  await expect(page.locator('[name="altcha"]')).toHaveValue(/.+/, { timeout: 15000 });
  await page.locator('#kc-login').click();

  // Code page (#kc-otp-form) — the OTP was just delivered to the inbox.
  const loginCode = await fetchLoginCode(email);
  await page.locator('#otp-code').fill(loginCode);
  await Promise.all([
    // `?` is a wildcard in Playwright globs, so match the query param explicitly.
    page.waitForURL(url => url.searchParams.get('login') === 'success', { timeout: 30000 }),
    page.locator('#kc-login').click(),
  ]);
};

export const authenticate = async (userName: string, authFile: string) => {
  setup.use({
    locale: 'en-GB',
    timezoneId: 'Europe/Berlin',
  });
  setup('authenticate', async () => {
    // Clean up any old OTP emails before starting authentication
    logger.debug({ userName }, 'authenticate: cleaning up old OTP emails');
    const cleanedCount = await cleanupOtpEmails(userName);
    logger.debug({ cleanedCount }, 'authenticate: cleaned up old OTP emails');

    const browser = await chromium.launch(
      isCI ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : undefined
    );
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('[data-testid="login-button"]').click();

    logger.debug('authenticate: completing tessera-otp login');
    await submitTesseraOtpLogin(page, userName);
    logger.debug('authenticate: login redirect completed');

    await page.goto('/user');
    await page.waitForLoadState('load');

    await expect(page.getByText(userName).first()).toBeVisible();
    mkdirSync(dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
    logger.debug('Auth Complete');
  });
};

export const checkIfLoggedIn = async (page: import('@playwright/test').Page) => {
  await page.goto('/user');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-testid="logged-in-menu-button"]')).toBeVisible();
};

export const logout = async (page: import('@playwright/test').Page) => {
  logger.debug('Logging out user');
  await page.goto('/api/logout');
  await page.waitForLoadState('load');
  logger.debug('User logged out, redirected to homepage');
};
