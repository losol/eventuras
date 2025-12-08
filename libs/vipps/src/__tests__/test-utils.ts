/**
 * Test utilities and helpers for Vipps integration tests
 */

import type { VippsConfig } from '../vipps-core';

/**
 * Check if we have valid test environment configuration
 */
export function hasTestConfig(): boolean {
  return !!(
    process.env.VIPPS_CLIENT_ID &&
    process.env.VIPPS_CLIENT_SECRET &&
    process.env.VIPPS_SUBSCRIPTION_KEY &&
    process.env.VIPPS_MERCHANT_SERIAL_NUMBER
  );
}

/**
 * Get test configuration for Vipps API
 */
export function getTestConfig(): VippsConfig {
  if (!hasTestConfig()) {
    throw new Error(
      'Missing required environment variables. Please configure .env file with Vipps test credentials.'
    );
  }

  return {
    apiUrl: 'https://apitest.vipps.no',
    merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
    clientId: process.env.VIPPS_CLIENT_ID!,
    clientSecret: process.env.VIPPS_CLIENT_SECRET!,
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
    systemName: 'Eventuras',
    systemVersion: '1.0.0',
    pluginName: 'eventuras-vipps-tests',
    pluginVersion: '1.0.0',
  };
}

/**
 * Generate a unique reference for testing
 */
export function generateTestReference(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Sleep for specified milliseconds (useful for polling)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test phone number for Vipps test environment
 * These should be obtained from portal.vippsmobilepay.com
 */
export function getTestPhoneNumber(): string {
  return process.env.VIPPS_TEST_PHONE_NUMBER || '4712345678';
}

/**
 * Poll for payment to reach expected state
 * Useful for waiting after force approve or other async operations
 *
 * @param getPaymentFn - Function that retrieves payment details
 * @param expectedState - The state to wait for (e.g., 'AUTHORIZED', 'CAPTURED')
 * @param maxAttempts - Maximum number of polling attempts (default: 20)
 * @param intervalMs - Milliseconds between attempts (default: 1000)
 */
export async function waitForPaymentState(
  getPaymentFn: () => Promise<{ state: string }>,
  expectedState: string,
  maxAttempts: number = 20,
  intervalMs: number = 1000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const payment = await getPaymentFn();
    if (payment.state === expectedState) {
      return;
    }
    await sleep(intervalMs);
  }
  throw new Error(
    `Payment did not reach ${expectedState} state after ${maxAttempts} attempts`
  );
}
