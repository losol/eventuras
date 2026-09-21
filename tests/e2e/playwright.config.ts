/* eslint no-process-env: 0 */

import { defineConfig, devices } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse a .env file without a dotenv dependency: KEY=value lines, comments skipped.
const readEnvFile = (path: string): Record<string, string> => {
  const vars: Record<string, string> = {};
  readFileSync(path, 'utf-8')
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) return;

      const key = trimmed.substring(0, equalsIndex).trim();
      if (key) vars[key] = trimmed.substring(equalsIndex + 1).trim();
    });
  return vars;
};

const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  // What is already in the environment wins, so a one-off override on the command line
  // still works against a .env the AppHost rewrites on every start.
  const loaded = Object.entries(readEnvFile(envPath)).filter(
    ([key]) => process.env[key] === undefined
  );
  for (const [key, value] of loaded) {
    process.env[key] = value;
  }
  console.log(`✓ Loaded ${loaded.length} environment variables from .env`);
  console.log('Variables:', loaded.map(([key]) => key).join(', '));
} else if (!process.env.CI) {
  console.log('⚠ .env file not found - using existing environment variables');
}

// The session secret only has to match the web app's, so a local run takes it
// from apps/web/.env instead of repeating it.
const webEnvPath = join(__dirname, '../../apps/web/.env');
if (!process.env.E2E_SESSION_SECRET && existsSync(webEnvPath)) {
  const sessionSecret = readEnvFile(webEnvPath).SESSION_SECRET;
  // api-helpers decodes it as hex, so anything else would only fail later, at decrypt time.
  if (sessionSecret && /^([0-9a-f]{2})+$/i.test(sessionSecret)) {
    process.env.E2E_SESSION_SECRET = sessionSecret;
    console.log('✓ E2E_SESSION_SECRET taken from apps/web/.env');
  } else if (sessionSecret) {
    console.log(
      '⚠ SESSION_SECRET in apps/web/.env is not hex-encoded; set E2E_SESSION_SECRET explicitly'
    );
  }
}

const isCI = !!process.env.CI;
const HEALTHCHECK = 'healthcheck';
const SETUP_ADMIN = 'setup-admin';
const SETUP_USER = 'setup-user';
const SETUP_SYSTEMADMIN = 'setup-systemadmin';
const SETUP_ORGADMIN = 'setup-orgadmin';
const SETUP_GRANT_ADMIN = 'setup-grant-admin';

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
  outputDir: './test-results',
  timeout: timeouts.test,
  globalTimeout: timeouts.global,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report' }],
    ['./error-context-reporter.ts'],
    ['allure-playwright', { outputFolder: './allure-results' }],
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
      name: SETUP_SYSTEMADMIN,
      testMatch: /setup\/systemadmin\.auth\.setup\.ts/,
      dependencies: [HEALTHCHECK],
    },
    {
      name: SETUP_ORGADMIN,
      testMatch: /setup\/orgadmin\.auth\.setup\.ts/,
      dependencies: [HEALTHCHECK],
    },
    {
      // Grants the admin personas the backend org `Admin` role using the
      // systemadmin token.
      name: SETUP_GRANT_ADMIN,
      testMatch: /setup\/grant-admin-role\.setup\.ts/,
      dependencies: [SETUP_ADMIN, SETUP_SYSTEMADMIN, SETUP_ORGADMIN],
    },
    {
      name: 'web:admin',
      testMatch: /web\/admin\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_GRANT_ADMIN],
    },
    {
      name: 'web:user',
      testMatch: /web\/user\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_USER, 'web:admin'],
    },
    {
      name: 'web:systemadmin',
      testMatch: /web\/systemadmin\/.+\.spec\.ts/,
      use: { ...chromeDesktop },
      dependencies: [SETUP_SYSTEMADMIN],
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
      dependencies: [SETUP_ADMIN, SETUP_USER, SETUP_GRANT_ADMIN],
    },
  ],
});
