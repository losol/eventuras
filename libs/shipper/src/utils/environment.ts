/**
 * Environment variable validation and configuration for Shipper
 */

import type { BringEnvironment } from '../bring-v1/types';

/**
 * Required environment variables for Shipper (Bring API)
 */
const REQUIRED_ENV_VARS = [
  'BRING_API_UID',
  'BRING_API_KEY',
  'BRING_CUSTOMER_ID',
] as const;

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  BRING_ENVIRONMENT: 'test' as BringEnvironment, // Default to test environment
  BRING_CLIENT_URL: 'https://your-app.example.com',
} as const;

/**
 * Check if all required Shipper environment variables are set
 * @returns true if all required variables are present
 */
export function hasShipperConfig(): boolean {
  return REQUIRED_ENV_VARS.every((varName) => !!process.env[varName]);
}

/**
 * Get Shipper configuration from environment variables
 * @throws {Error} if required environment variables are missing
 * @returns Configuration object for Bring API
 */
export function getShipperConfig() {
  const missing = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for Shipper: ${missing.join(', ')}. ` +
        'Please configure them in your .env file.'
    );
  }

  return {
    apiKey: process.env.BRING_API_KEY!,
    apiUid: process.env.BRING_API_UID!,
    clientUrl: process.env.BRING_CLIENT_URL || OPTIONAL_ENV_VARS.BRING_CLIENT_URL,
    customerId: process.env.BRING_CUSTOMER_ID!,
    environment: (process.env.BRING_ENVIRONMENT || OPTIONAL_ENV_VARS.BRING_ENVIRONMENT) as BringEnvironment,
  };
}

/**
 * Get list of missing required environment variables
 * @returns Array of missing variable names, empty if all are set
 */
export function getMissingEnvVars(): string[] {
  return REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);
}

/**
 * Validate environment configuration and log warnings
 * Used in test setup to warn about missing variables
 */
export function validateEnvConfig(): void {
  const missing = getMissingEnvVars();

  if (missing.length > 0) {
    console.warn(
      '⚠️  Warning: Missing required environment variables:',
      missing.join(', ')
    );
    console.warn(
      '   Tests requiring real API calls will be skipped. Copy .env.example to .env to enable them.'
    );
  }
}
