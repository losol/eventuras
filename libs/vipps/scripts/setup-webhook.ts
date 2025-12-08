#!/usr/bin/env tsx
/**
 * Vipps Webhook Setup Script
 *
 * This script helps you register a webhook with Vipps and get the secret.
 * Run this once per environment (test/production) to set up webhooks.
 *
 * Usage:
 *   pnpm webhook:setup
 *
 * Environment variables required:
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_MERCHANT_SERIAL_NUMBER
 *   VIPPS_SUBSCRIPTION_KEY
 *   VIPPS_USE_TEST_MODE (optional, defaults to true)
 *
 * You will be prompted for:
 *   - Webhook URL (where Vipps should send notifications)
 *   - Events to subscribe to
 */

import * as readline from 'readline';

import { registerWebhook } from '../src/webhooks-v1/client';
import type { WebhookEventType } from '../src/webhooks-v1/types';
import type { VippsConfig } from '../src/vipps-core';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const availableEvents: WebhookEventType[] = [
  'epayments.payment.created.v1',
  'epayments.payment.aborted.v1',
  'epayments.payment.expired.v1',
  'epayments.payment.captured.v1',
  'epayments.payment.cancelled.v1',
  'epayments.payment.refunded.v1',
  'epayments.payment.authorized.v1',
  'epayments.payment.terminated.v1',
];

async function main() {
  console.log('🎯 Vipps Webhook Setup\n');

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
  console.log(`📍 Environment: ${useTestMode ? 'TEST' : 'PRODUCTION'}\n`);

  const apiUrl = useTestMode ? 'https://apitest.vipps.no' : 'https://api.vipps.no';

  const config: VippsConfig = {
    apiUrl,
    clientId: process.env.VIPPS_CLIENT_ID!,
    clientSecret: process.env.VIPPS_CLIENT_SECRET!,
    merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
    systemName: 'vipps-webhook-setup',
    systemVersion: '1.0.0',
    pluginName: '',
    pluginVersion: '',
  };

  // Get webhook URL
  const url = await question('Webhook URL (e.g., https://your-domain.com/api/webhooks/vipps): ');
  if (!url || !url.startsWith('https://')) {
    console.error('❌ Invalid URL. Must start with https://');
    rl.close();
    process.exit(1);
  }

  // Show available events
  console.log('\n📋 Available events:');
  availableEvents.forEach((event, i) => {
    console.log(`   ${i + 1}. ${event}`);
  });

  const eventsInput = await question(
    '\nSelect events (comma-separated numbers, e.g., "1,4,5" or "all"): ',
  );

  let selectedEvents: WebhookEventType[];
  if (eventsInput.toLowerCase() === 'all') {
    selectedEvents = availableEvents;
  } else {
    const indices = eventsInput
      .split(',')
      .map((s) => parseInt(s.trim()) - 1)
      .filter((i) => i >= 0 && i < availableEvents.length);

    if (indices.length === 0) {
      console.error('❌ No valid events selected');
      rl.close();
      process.exit(1);
    }

    selectedEvents = indices
      .map((i) => availableEvents[i])
      .filter((e): e is WebhookEventType => e !== undefined);
  }

  console.log('\n📝 Summary:');
  console.log(`   URL: ${url}`);
  console.log(`   Events: ${selectedEvents.join(', ')}\n`);

  const confirm = await question('Proceed with registration? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    process.exit(0);
  }

  try {
    console.log('\n⏳ Registering webhook...');

    const response = await registerWebhook(config, {
      url,
      events: selectedEvents,
    });

    console.log('\n✅ Webhook registered successfully!\n');
    console.log('📋 Details:');
    console.log(`   ID: ${response.id}`);
    console.log(`   Secret: ${response.secret}\n`);
    console.log('⚠️  IMPORTANT: Save this secret as an environment variable:');
    console.log(`   VIPPS_WEBHOOK_SECRET=${response.secret}\n`);
    console.log('⚠️  You will NOT be able to retrieve this secret again.');
    console.log('   If you lose it, you must delete and re-register the webhook.\n');
  } catch (error) {
    console.error('\n❌ Failed to register webhook:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
