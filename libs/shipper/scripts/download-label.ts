#!/usr/bin/env tsx
/**
 * Download a Bring shipping label as PDF.
 *
 * Usage:
 *   pnpm label:download --label-url "https://api.bring.com/booking/api/booking/labels/XXX"
 *   pnpm label:download --label-url "..." --output custom-label.pdf
 *   pnpm label:download --label-url "..." --json
 *
 * Environment variables required (from .env file):
 *   BRING_API_UID
 *   BRING_API_KEY
 *   BRING_CUSTOMER_ID
 *   BRING_ENVIRONMENT  (optional, defaults to 'test')
 *   BRING_CLIENT_URL   (optional)
 */

import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { BringClient } from '../src/bring-v1/index.js';
import { getShipperConfig } from '../src/utils/environment.js';

const { values } = parseArgs({
  options: {
    json: { type: 'boolean', default: false },
    'label-url': { type: 'string' },
    output: { type: 'string', short: 'o' },
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

/**
 * Validate that a label URL is safe to call with Bring API credentials.
 *
 * `fetchLabel()` attaches BRING_API_KEY/BRING_API_UID as request headers, so an
 * arbitrary URL would leak those credentials to that host. Only allow HTTPS URLs
 * pointing at an official Bring API host.
 */
function assertSafeLabelUrl(rawUrl: string): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    fail('--label-url must be a valid URL');
  }

  if (url.protocol !== 'https:') {
    fail('--label-url must use HTTPS');
  }

  const host = url.hostname.toLowerCase();
  if (host !== 'bring.com' && !host.endsWith('.bring.com')) {
    fail('--label-url must point to a Bring API host (*.bring.com)');
  }
}

async function main(): Promise<void> {
  const labelUrl = values['label-url'];
  if (!labelUrl) {
    fail('--label-url is required');
  }

  assertSafeLabelUrl(labelUrl);

  const config = getShipperConfig();
  const client = new BringClient(config);

  const labelData = await client.fetchLabel(labelUrl);
  const outputPath = values.output ?? `label-${Date.now()}.pdf`;

  writeFileSync(outputPath, Buffer.from(labelData));

  if (json) {
    console.log(
      JSON.stringify(
        {
          outputPath,
          sizeBytes: labelData.byteLength,
          success: true,
        },
        null,
        2
      )
    );
  } else {
    console.log('✓ Label downloaded successfully!');
    console.log(`File: ${outputPath}`);
    console.log(`Size: ${labelData.byteLength} bytes`);
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : 'Unknown error');
});
