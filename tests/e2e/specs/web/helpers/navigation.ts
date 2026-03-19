import { Logger } from '@eventuras/logger';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const logger = Logger.create({ namespace: 'e2e:navigation' });

export const checkIfUnAuthorized = async (page: Page, url: string) => {
  await page.goto(url);
  // Protected pages should redirect away to the identity provider
  // The exact URL depends on the IdP (Auth0, idem-idp, etc.), so we just
  // verify the user is no longer on the requested page
  await page.waitForURL((currentUrl) => !currentUrl.pathname.startsWith(url), { timeout: 15000 });
  logger.debug({ from: url, to: page.url() }, 'Redirected away');
};

export const checkIfAccessToAdmin = async (page: Page) => {
  logger.debug('admin access check');
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-testid="add-event-button"]')).toBeVisible();
};
