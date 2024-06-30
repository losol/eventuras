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
const timeOut = 1000 * 60 * 10; //max 10 minutes for all
const devicesToTest = devices['Desktop Chrome'];
const SETUP_ADMIN = 'setup-admin';
const SETUP_USER = 'setup-user';
export default defineConfig({
  timeout: timeOut,
  globalTimeout: timeOut,
  testDir: './playwright-e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
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
    { name: SETUP_ADMIN, testMatch: 'admin.auth.setup.ts' },
    { name: SETUP_USER, testMatch: 'user.auth.setup.ts' },
    {
      name: 'e2e admin tests',
      testMatch: /admin-.{0,100}\.spec\.ts/,
      use: {
        ...devicesToTest,
      },
      dependencies: [SETUP_ADMIN],
    },
    {
      name: 'e2e user tests chromium',
      testMatch: /user-.{0,100}\.spec\.ts/,
      use: {
        ...devicesToTest,
      },
      dependencies: [SETUP_USER],
    },
  ],
});
