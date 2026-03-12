import { Debug } from '@eventuras/logger';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const debug = Debug.create('e2e:navigation');

export const checkIfUnAuthorized = async (page: Page, url: string) => {
  await page.goto(url);
  // Protected pages should redirect away to the identity provider
  // The exact URL depends on the IdP (Auth0, idem-idp, etc.), so we just
  // verify the user is no longer on the requested page
  await page.waitForURL((currentUrl) => !currentUrl.pathname.startsWith(url), { timeout: 15000 });
  debug('Redirected away from %s to %s', url, page.url());
};

export const checkIfAccessToAdmin = async (page: Page) => {
  debug('admin access check');
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-testid="add-event-button"]')).toBeVisible();
};
