import { Debug } from '@eventuras/logger';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const debug = Debug.create('e2e:navigation');

export const checkIfUnAuthorized = async (page: Page, url: string) => {
  await page.goto(url);
  const location = `/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`;
  await page.waitForURL(location);
  return expect(page).toHaveURL(location);
};

export const checkIfAccessToAdmin = async (page: Page) => {
  debug('admin access check');
  await page.goto('/admin');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-testid="add-event-button"]')).toBeVisible();
};
