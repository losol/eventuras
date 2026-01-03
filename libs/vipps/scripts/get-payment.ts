#!/usr/bin/env tsx
/**
 * CLI tool to fetch Vipps payment details
 *
 * Usage:
 *   pnpm payment:get <payment-reference>
 *
 * Example:
 *   pnpm payment:get acme-shop-123-order-3456
 *
 * Environment variables required (from .env file):
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_SUBSCRIPTION_KEY
 *   VIPPS_MERCHANT_SERIAL_NUMBER (MSN)
 *   VIPPS_USE_TEST_MODE (optional, defaults to true)
 */

import { getPaymentDetails } from '../src/epayment-v1/client.js';
import type { VippsConfig } from '../src/vipps-core/index.js';

async function main() {
  const paymentReference = process.argv[2];

  if (!paymentReference) {
    console.error('Error: Payment reference is required');
    console.error('\nUsage: pnpm payment:get <payment-reference>');
    console.error('\nExample:');
    console.error('  pnpm payment:get acme-shop-123-order-3456');
    process.exit(1);
  }

  // Build Vipps configuration from environment variables
  const isTestMode = process.env.VIPPS_USE_TEST_MODE !== 'false';
  const config: VippsConfig = {
    clientId: process.env.VIPPS_CLIENT_ID!,
    clientSecret: process.env.VIPPS_CLIENT_SECRET!,
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
    merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
    isTest: isTestMode,
    apiUrl: isTestMode ? 'https://apitest.vipps.no' : 'https://api.vipps.no',
  };

  // Validate configuration
  const missingVars: string[] = [];
  if (!config.clientId) missingVars.push('VIPPS_CLIENT_ID');
  if (!config.clientSecret) missingVars.push('VIPPS_CLIENT_SECRET');
  if (!config.subscriptionKey) missingVars.push('VIPPS_SUBSCRIPTION_KEY');
  if (!config.merchantSerialNumber) missingVars.push('VIPPS_MERCHANT_SERIAL_NUMBER');

  if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Make sure you have a .env file with these variables set.');
    process.exit(1);
  }

  try {
    const payment = await getPaymentDetails(config, paymentReference);
    console.log(JSON.stringify(payment, null, 2));
  } catch (error) {
    console.error('Error: Failed to fetch payment details');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
