/* eslint no-process-env: 0 */

import { defineConfig, devices } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually without dotenv dependency
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  let loadedCount = 0;
  const loadedVars: string[] = [];
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) return;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) return; // No equals sign

    const key = trimmed.substring(0, equalsIndex).trim();
    const value = trimmed.substring(equalsIndex + 1).trim();

    if (key) {
      process.env[key] = value;
      loadedVars.push(key);
      loadedCount++;
    }
  });
  console.log(`✓ Loaded ${loadedCount} environment variables from .env`);
  console.log('Variables:', loadedVars.join(', '));
} else {
  console.log('⚠ .env file not found - using existing environment variables');
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const timeOut = 1000 * 60 * 5; // 5 minutes global max for entire suite
const testTimeout = 1000 * 120; // 2 minute per test (registration flow has many steps)
const actionTimeout = 1000 * 10; // 10 seconds per action/navigation
const devicesToTest = devices['Desktop Chrome'];
const SETUP_ADMIN = 'setup-admin';
const SETUP_USER = 'setup-user';
export default defineConfig({
  timeout: testTimeout,
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
    actionTimeout: actionTimeout,
    navigationTimeout: actionTimeout,

    // Emulates the user timezone.
    timezoneId: 'Europe/Paris',
  },

  /* Configure web server to start automatically */
  webServer: {
    command: 'cd ../web && pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    { name: SETUP_ADMIN, testMatch: 'admin.auth.setup.ts' },
    { name: SETUP_USER, testMatch: 'user.auth.setup.ts' },
    {
      name: 'e2e admin tests',
      testMatch: /admin-.{0,1000}\.spec\.ts/,
      use: {
        ...devicesToTest,
      },
      dependencies: [SETUP_ADMIN],
    },
    {
      name: 'e2e user tests chromium',
      testMatch: /user-.{0,1000}\.spec\.ts/,
      use: {
        ...devicesToTest,
      },
      dependencies: [SETUP_USER],
    },
    {
      name: 'api tests',
      testMatch: /\d{3}-api-.{0,1000}\.spec\.ts/,
      use: {
        ...devicesToTest,
      },
      dependencies: [SETUP_ADMIN, SETUP_USER],
    },
  ],
});
