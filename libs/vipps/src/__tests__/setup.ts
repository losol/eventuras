/**
 * Test setup for Vipps integration tests
 *
 * This file is automatically loaded before each test file.
 * Environment variables are automatically loaded by Vitest from .env file.
 *
 * Note: Vitest loads .env, .env.local, .env.[mode], and .env.[mode].local files
 * from the project root automatically. No need for dotenv package in tests.
 */

// Validate required environment variables
const requiredEnvVars = [
  'VIPPS_CLIENT_ID',
  'VIPPS_CLIENT_SECRET',
  'VIPPS_SUBSCRIPTION_KEY',
  'VIPPS_MERCHANT_SERIAL_NUMBER',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    '⚠️  Warning: Missing required environment variables:',
    missingVars.join(', ')
  );
  console.warn(
    '   Tests requiring real API calls will be skipped. Copy .env.example to .env to enable them.'
  );
}
