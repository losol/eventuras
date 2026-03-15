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
} else if (!process.env.CI) {
  console.log('⚠ .env file not found - using existing environment variables');
}

const isCI = !!process.env.CI;
const HEALTHCHECK = 'healthcheck';
const SETUP_ADMIN = 'setup-admin';
const SETUP_USER = 'setup-user';

const timeouts = {
  global: 1000 * 60 * 5,
  test: 1000 * 120,
  action: 1000 * 10,
};

if (!process.env.E2E_WEB_URL) {
  throw new Error('E2E_WEB_URL must be set (e.g. http://localhost:3000)');
}

const chromeDesktop = devices['Desktop Chrome'];

export default defineConfig({
  testDir: './specs',
  outputDir: './tmp/results',
  timeout: timeouts.test,
  globalTimeout: timeouts.global,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: './tmp/report' }],
    ['./error-context-reporter.ts'],
    ['allure-playwright', { outputFolder: './tmp/allure-results' }],
  ],

  use: {
    baseURL: process.env.E2E_WEB_URL,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
    actionTimeout: timeouts.action,
    navigationTimeout: timeouts.action,
    // Disable Chromium sandbox in containers (K8s lacks kernel namespace support)
    launchOptions: isCI ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : undefined,
  },

  projects: [
    { name: HEALTHCHECK, testMatch: /setup\/healthcheck\.setup\.ts/ },
    { name: SETUP_ADMIN, testMatch: /setup\/admin\.auth\.setup\.ts/, dependencies: [HEALTHCHECK] },
    { name: SETUP_USER, testMatch: /setup\/user\.auth\.setup\.ts/, dependencies: [HEALTHCHECK] },
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
      dependencies: [SETUP_USER, 'web:admin'],
    },
    {
      name: 'web:public',
      testMatch: /web\/public\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: ['web:admin'],
    },
    {
      name: 'api',
      testMatch: /api\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_ADMIN, SETUP_USER],
    },
  ],
});
