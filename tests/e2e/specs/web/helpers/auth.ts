import { Logger } from '@eventuras/logger';
import { chromium, expect, test as setup } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { cleanupOtpEmails, fetchLoginCode } from '../../shared/utils';

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
    await page.locator('[id="username"]').fill(userName);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    logger.debug('authenticate: attempting to fetch login code');
    const loginCode = await fetchLoginCode(userName);
    await page.locator('[id="code"]').fill(loginCode!);
    // Click Continue and wait for the full Auth0 redirect chain to complete.
    // The callback route appends ?login=success, so wait for that.
    // Use Promise.all to avoid the click timing out on the cross-domain redirect.
    await Promise.all([
      page.waitForURL('**?login=success**', { timeout: 30000 }),
      page.getByRole('button', { name: 'Continue', exact: true }).click(),
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
