#!/usr/bin/env tsx
/**
 * Create a Bring shipment.
 *
 * Usage:
 *   pnpm shipment:create \
 *     --correlation-id "EVENT-2026-001" \
 *     --sender-name "Eventuras AS" \
 *     --sender-address "Testveien 1" \
 *     --sender-postal "0001" \
 *     --sender-city "Oslo" \
 *     --recipient-name "Test Recipient" \
 *     --recipient-address "Testgata 42" \
 *     --recipient-postal "0010" \
 *     --recipient-city "Oslo" \
 *     --weight 1000 \
 *     --length 30 --width 20 --height 10
 *
 * Environment variables required (from .env file):
 *   BRING_API_UID
 *   BRING_API_KEY
 *   BRING_CUSTOMER_ID
 *   BRING_ENVIRONMENT  (optional, defaults to 'test')
 *   BRING_CLIENT_URL   (optional)
 */

import { parseArgs } from 'node:util';

import { BringClient, toBringAddress } from '../src/bring-v1/index.js';
import { getShipperConfig } from '../src/utils/environment.js';

const { values } = parseArgs({
  options: {
    'correlation-id': { type: 'string' },
    height: { type: 'string' },
    json: { type: 'boolean', default: false },
    length: { type: 'string' },
    product: { type: 'string', default: 'SERVICEPAKKE' },
    production: { type: 'boolean', default: false },
    'recipient-address': { type: 'string' },
    'recipient-address2': { type: 'string' },
    'recipient-city': { type: 'string' },
    'recipient-country': { type: 'string', default: 'NO' },
    'recipient-email': { type: 'string' },
    'recipient-name': { type: 'string' },
    'recipient-phone': { type: 'string' },
    'recipient-postal': { type: 'string' },
    'sender-address': { type: 'string' },
    'sender-address2': { type: 'string' },
    'sender-city': { type: 'string' },
    'sender-country': { type: 'string', default: 'NO' },
    'sender-email': { type: 'string' },
    'sender-name': { type: 'string' },
    'sender-phone': { type: 'string' },
    'sender-postal': { type: 'string' },
    'shipping-date': { type: 'string' },
    weight: { type: 'string' },
    width: { type: 'string' },
  },
});

const json = values.json ?? false;

function fail(message: string): never {
  if (json) {
    console.log(JSON.stringify({ error: message, success: false }, null, 2));
  } else {
    console.error(`Error: ${message}`);
  }

  process.exit(1);
}

function requireString(name: string): string {
  const value = values[name as keyof typeof values];
  if (typeof value !== 'string' || value.length === 0) {
    fail(`--${name} is required`);
  }

  return value as string;
}

function requireInt(name: string): number {
  const raw = requireString(name);
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    fail(`--${name} must be a positive integer`);
  }

  return parsed;
}

async function main(): Promise<void> {
  const config = getShipperConfig();

  // Guard against accidental production shipments
  if (config.environment === 'production' && !values.production) {
    if (!json) {
      console.warn('⚠️  WARNING: Using PRODUCTION Bring API!');
      console.warn('   This will create a REAL shipment and may incur costs.');
      console.warn('   Set BRING_ENVIRONMENT=test to use test environment.');
    }

    fail('Production environment requires explicit --production flag');
  }

  const correlationId = requireString('correlation-id');
  const shippingDate =
    values['shipping-date'] ??
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const client = new BringClient(config);

  const consignment = {
    correlationId,
    packages: [
      {
        correlationId: `${correlationId}-pkg-1`,
        dimensions: {
          heightInCm: requireInt('height'),
          lengthInCm: requireInt('length'),
          widthInCm: requireInt('width'),
        },
        weightInGrams: requireInt('weight'),
      },
    ],
    parties: {
      recipient: toBringAddress({
        addressLine1: requireString('recipient-address'),
        addressLine2: values['recipient-address2'],
        city: requireString('recipient-city'),
        countryCode: values['recipient-country'] ?? 'NO',
        email: values['recipient-email'],
        name: requireString('recipient-name'),
        phone: values['recipient-phone'],
        postalCode: requireString('recipient-postal'),
      }),
      sender: toBringAddress({
        addressLine1: requireString('sender-address'),
        addressLine2: values['sender-address2'],
        city: requireString('sender-city'),
        countryCode: values['sender-country'] ?? 'NO',
        email: values['sender-email'],
        name: requireString('sender-name'),
        phone: values['sender-phone'],
        postalCode: requireString('sender-postal'),
      }),
    },
    product: {
      customerNumber: config.customerId,
      id: values.product ?? 'SERVICEPAKKE',
    },
    shippingDateTime: shippingDate,
  };

  const response = await client.createShipment(consignment);

  const shipment = response.consignments?.[0];
  if (!shipment) {
    throw new Error('Bring API did not return any consignments for the created shipment.');
  }

  const pkg = shipment.confirmation.packages?.[0];
  if (!pkg) {
    throw new Error('Bring API did not return any packages for the created consignment.');
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          consignmentNumber: shipment.confirmation.consignmentNumber,
          labelUrl: shipment.confirmation.links.labels,
          success: true,
          trackingNumber: pkg.trackingNumber,
          trackingUrl: shipment.confirmation.links.tracking,
        },
        null,
        2
      )
    );
  } else {
    console.log('✓ Shipment created successfully!');
    console.log(`Consignment number: ${shipment.confirmation.consignmentNumber}`);
    if (pkg.trackingNumber) {
      console.log(`Tracking number: ${pkg.trackingNumber}`);
    }

    console.log(`Tracking URL: ${shipment.confirmation.links.tracking}`);
    if (shipment.confirmation.links.labels) {
      console.log(`Label URL: ${shipment.confirmation.links.labels}`);
    }
  }
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : 'Unknown error');
}
