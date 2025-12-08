#!/usr/bin/env tsx
/**
 * Vipps Webhook Deletion Script
 *
 * Delete a registered webhook by ID.
 *
 * Usage:
 *   pnpm webhook:delete <webhook-id>
 *
 * Environment variables required:
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_MERCHANT_SERIAL_NUMBER
 *   VIPPS_SUBSCRIPTION_KEY
 *   VIPPS_USE_TEST_MODE (optional, defaults to true)
 */

import { deleteWebhook } from '../src/webhooks-v1/client';
import type { VippsConfig } from '../src/vipps-core';

async function main() {
  const webhookId = process.argv[2];

  if (!webhookId) {
    console.error('❌ Usage: pnpm tsx scripts/delete-webhook.ts <webhook-id>');
    console.error('\nTip: Use list-webhooks.ts to find webhook IDs');
    process.exit(1);
  }

  console.log('🗑️  Deleting Vipps Webhook\n');

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
    systemName: 'vipps-webhook-delete',
    systemVersion: '1.0.0',
    pluginName: '',
    pluginVersion: '',
  };

  try {
    console.log(`⏳ Deleting webhook ${webhookId}...\n`);

    await deleteWebhook(config, webhookId);

    console.log('✅ Webhook deleted successfully!\n');
  } catch (error) {
    console.error('\n❌ Failed to delete webhook:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
