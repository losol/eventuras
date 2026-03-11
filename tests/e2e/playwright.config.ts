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

const isCI = !!process.env.CI;
const SETUP_ADMIN = 'setup-admin';
const SETUP_USER = 'setup-user';

const timeouts = {
  global: 1000 * 60 * 5,
  test: 1000 * 120,
  action: 1000 * 10,
};

const localWebServer = {
  command: 'cd ../../apps/web && pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: true,
  timeout: 120 * 1000,
};

const chromeDesktop = devices['Desktop Chrome'];

export default defineConfig({
  testDir: './specs',
  timeout: timeouts.test,
  globalTimeout: timeouts.global,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: process.env.TEST_BASE_URL,
    trace: 'on',
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
    actionTimeout: timeouts.action,
    navigationTimeout: timeouts.action,
  },

  webServer: isCI ? undefined : localWebServer,

  projects: [
    { name: SETUP_ADMIN, testMatch: /setup\/admin\.auth\.setup\.ts/ },
    { name: SETUP_USER, testMatch: /setup\/user\.auth\.setup\.ts/ },
    {
      name: 'web:admin',
      testMatch: /web\/admin\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_ADMIN],
    },
    {
      name: 'web:user',
      testMatch: /web\/user\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_USER],
    },
    {
      name: 'web:public',
      testMatch: /web\/public\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_ADMIN, SETUP_USER],
    },
    {
      name: 'api',
      testMatch: /api\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_ADMIN, SETUP_USER],
    },
  ],
});
