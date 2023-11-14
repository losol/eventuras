/* eslint no-process-env: 0 */
import { chromium, Page } from '@playwright/test';
import { expect, test as setup } from '@playwright/test';
import dotenv from 'dotenv';

import Logger from '@/utils/Logger';

dotenv.config();

const authFile = 'playwright-auth/user.json';
const getLoginButton = (page: Page) => page.locator('[data-test-id="login-button"]');

setup.use({
  locale: 'en-GB',
  timezoneId: 'Europe/Berlin',
});
setup('authenticate', async () => {
  const userName = process.env.TEST_E2E_USER!;
  const password = process.env.TEST_E2E_PASSWORD!;
  const userProfileName = process.env.TEST_E2E_PROFILE_NAME!;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForLoadState('load');
  await getLoginButton(page).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();

  const authButton = await page.getByRole('button', { name: 'Sign in with Auth0' });
  const hasAuthButton = (await authButton.count()) > 0;
  Logger.info({ namespace: 'testing.auth' }, { hasAuthButton });
  if (hasAuthButton) {
    await authButton.click();
  }

  await expect(page.locator('[type="email"]')).toBeVisible();
  await page.locator('[type="email"]').fill(userName);
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('[type="password"]')).toBeVisible();
  //asked for password, fill it in
  await page.locator('[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForURL('/');

  await page.goto('/user');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(userProfileName)).toBeVisible();
  await context.storageState({ path: authFile });
  Logger.info({ namespace: 'testing.auth' }, 'Auth Complete');
});
