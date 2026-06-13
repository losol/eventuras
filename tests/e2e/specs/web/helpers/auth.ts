import { Logger } from '@eventuras/logger';
import { chromium, expect, test as setup } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { cleanupOtpEmails, fetchLoginCode } from '../../../utils/otp';

const logger = Logger.create({ namespace: 'e2e:auth' });
const isCI = !!process.env.CI;

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

    // tessera-otp start page (keycloak-ratio-theme): enter the email, wait for the
    // ALTCHA challenge to auto-solve into its hidden field — the server rejects the
    // form otherwise — then submit.
    await page.locator('#email').fill(userName);
    await page.waitForFunction(() => {
      const altcha = document.querySelector('[name="altcha"]');
      return altcha instanceof HTMLInputElement && altcha.value.length > 0;
    });
    await page.locator('#kc-login').click();

    logger.debug('authenticate: attempting to fetch login code');
    const loginCode = await fetchLoginCode(userName);

    // tessera-otp code page: enter the OTP and submit. The web app's callback
    // appends ?login=success — wait for that to confirm the full redirect chain.
    await page.locator('#otp-code').fill(loginCode!);
    await Promise.all([
      page.waitForURL('**?login=success**', { timeout: 30000 }),
      page.locator('#kc-login').click(),
    ]);
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
