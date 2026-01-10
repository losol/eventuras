/**
 * Test utilities and helpers for Shipper integration tests
 */

import type { BringConfig } from './types';
import { hasShipperConfig, getShipperConfig } from '../utils/environment';

/**
 * Check if we have valid test environment configuration
 */
export function hasTestConfig(): boolean {
  return hasShipperConfig();
}

/**
 * Get test configuration for Bring API
 * Always uses test environment to ensure tests don't hit production
 */
export function getTestConfig(): BringConfig {
  const config = getShipperConfig();
  // Force test environment for integration tests
  return {
    ...config,
    environment: 'test',
  };
}

/**
 * Generate a unique correlation ID for testing
 */
export function generateTestCorrelationId(prefix: string = 'test'): string {
  const uuid = crypto.randomUUID();
  return `${prefix}-${uuid}`;
}

/**
 * Sleep for specified milliseconds (useful for polling)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get test sender address (Eventuras office)
 */
export function getTestSenderAddress() {
  return {
    name: 'Losvik kommune',
    addressLine: 'Testveien 1',
    postalCode: '0001',
    city: 'Oslo',
    countryCode: 'NO',
    contact: {
      phoneNumber: '+4712345678',
      email: 'test@eventuras.com',
    },
  };
}

/**
 * Get test recipient address
 */
export function getTestRecipientAddress() {
  return {
    name: 'Test Recipient',
    addressLine: 'Testgata 42',
    postalCode: '0010',
    city: 'Oslo',
    countryCode: 'NO',
    contact: {
      phoneNumber: '+4787654321',
      email: 'recipient@example.com',
    },
  };
}

/**
 * Get test package dimensions
 */
export function getTestPackage() {
  return {
    weightInGrams: 1000, // 1 kg
    lengthInCm: 30,
    widthInCm: 20,
    heightInCm: 10,
  };
}

/**
 * Get current date in ISO format for shipping date
 */
export function getTodayISODate(): string {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

/**
 * Get tomorrow's date in ISO format for shipping date
 */
export function getTomorrowISODate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}
