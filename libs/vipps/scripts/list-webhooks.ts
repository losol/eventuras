#!/usr/bin/env tsx
/**
 * Vipps Webhook Management Script
 *
 * List all registered webhooks for the configured MSN.
 *
 * Usage:
 *   pnpm tsx scripts/list-webhooks.ts
 *
 * Environment variables required:
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_MERCHANT_SERIAL_NUMBER
 *   VIPPS_SUBSCRIPTION_KEY
 *   VIPPS_USE_TEST_MODE (optional, defaults to true)
 */

import { listWebhooks } from '../src/webhooks-v1/client';
import type { VippsConfig } from '../src/vipps-core';

async function main() {
  console.log('🔍 Listing Vipps Webhooks\n');

  // Check required env vars
  const required = [
    'VIPPS_CLIENT_ID',
    'VIPPS_CLIENT_SECRET',
    'VIPPS_MERCHANT_SERIAL_NUMBER',
    'VIPPS_SUBSCRIPTION_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1);
  }

  const useTestMode = process.env.VIPPS_USE_TEST_MODE !== 'false';
  const apiUrl = useTestMode ? 'https://apitest.vipps.no' : 'https://api.vipps.no';

  const config: VippsConfig = {
    apiUrl,
    clientId: process.env.VIPPS_CLIENT_ID!,
    clientSecret: process.env.VIPPS_CLIENT_SECRET!,
    merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
    systemName: 'vipps-webhook-list',
    systemVersion: '1.0.0',
    pluginName: '',
    pluginVersion: '',
  };

  try {
    console.log('⏳ Fetching webhooks...\n');

    const response = await listWebhooks(config);
    const webhooks = response.webhooks;

    if (webhooks.length === 0) {
      console.log('📭 No webhooks registered\n');
      return;
    }

    console.log(`📋 Found ${webhooks.length} webhook(s):\n`);

    webhooks.forEach((webhook, i) => {
      console.log(`${i + 1}. ID: ${webhook.id}`);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Events: ${webhook.events.join(', ')}\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to list webhooks:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
