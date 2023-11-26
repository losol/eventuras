/* eslint no-process-env: 0 */

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const timeOut = 1000 * 60 * 5; //max 5 minutes for all
export default defineConfig({
  timeout: timeOut,
  globalTimeout: timeOut,
  testDir: './playwright-e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.TEST_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    locale: 'en-GB',
    actionTimeout: timeOut,
    navigationTimeout: timeOut,

    // Emulates the user timezone.
    timezoneId: 'Europe/Paris',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    { name: 'setup-admin', testMatch: 'admin.auth.setup.ts' },
    { name: 'setup-user', testMatch: 'user.auth.setup.ts' },
    {
      name: 'e2e admin tests chromium',
      testMatch: /admin-.{0,100}\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright-auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'e2e user tests chromium',
      testMatch: /user-.{0,100}\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright-auth/user.json',
      },
      dependencies: ['setup-user'],
    },
  ],
});
