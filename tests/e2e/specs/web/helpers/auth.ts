import { Logger } from '@eventuras/logger';
import { chromium, expect, test as setup, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { cleanupOtpEmails, fetchLoginCode } from '../../../utils/otp';

const logger = Logger.create({ namespace: 'e2e:auth' });
const isCI = !!process.env.CI;

/**
 * Drives the custom tessera-otp login (keycloak-ratio-theme), assuming the login
 * start page is showing. Fills the email and submits, reads the OTP from the
 * inbox, and submits the code. Resolves once the web app's OIDC callback has
 * appended `?login=success`.
 *
 * Shared by the persona setup and the anonymous-registration spec so the IdP
 * selectors live in one place. The test realms have captcha (ALTCHA) disabled.
 */
export const submitTesseraOtpLogin = async (page: Page, email: string): Promise<void> => {
  // Start page (#kc-email-form)
  await page.locator('#email').fill(email);
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

/**
 * Logs the persona in via the tessera-otp flow in a fresh browser context and
 * saves the storage state to `authFile`. Standalone (no Playwright fixtures), so
 * it can be reused outside a `setup()` test — e.g. to refresh a session after a
 * role change.
 */
export const loginPersona = async (userName: string, authFile: string): Promise<void> => {
  // Clean up any old OTP emails before starting authentication
  logger.debug({ userName }, 'login: cleaning up old OTP emails');
  const cleanedCount = await cleanupOtpEmails(userName);
  logger.debug({ cleanedCount }, 'login: cleaned up old OTP emails');

  const browser = await chromium.launch(
    isCI ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : undefined
  );
  try {
    // A manually launched context doesn't inherit the config's `use.baseURL`, so
    // set it explicitly for the relative navigations below.
    const context = await browser.newContext({ baseURL: process.env.E2E_WEB_URL });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('[data-testid="login-button"]').click();

    logger.debug('login: completing tessera-otp login');
    await submitTesseraOtpLogin(page, userName);
    logger.debug('login: redirect completed');

    await page.goto('/user');
    await page.waitForLoadState('load');

    await expect(page.getByText(userName).first()).toBeVisible();
    mkdirSync(dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
    logger.debug('login: complete');
  } finally {
    await browser.close();
  }
};

export const authenticate = (userName: string, authFile: string) => {
  setup.use({
    locale: 'en-GB',
    timezoneId: 'Europe/Berlin',
  });
  setup('authenticate', () => loginPersona(userName, authFile));
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
