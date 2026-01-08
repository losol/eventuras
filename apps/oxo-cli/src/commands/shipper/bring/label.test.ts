/**
 * Integration tests for oxo shipper bring label command
 *
 * These tests verify the CLI command works by making real API calls
 * to the Bring test environment.
 *
 * Note: These tests require:
 * 1. Valid Bring test credentials in .env file
 * 2. A valid label URL (created by first running create command)
 */

import { runCommand } from '@oclif/test';
import { existsSync, unlinkSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

// Check if we have required env vars for integration tests
const hasTestConfig = Boolean(
  process.env.BRING_API_UID &&
    process.env.BRING_API_KEY &&
    process.env.BRING_CUSTOMER_ID,
);

const describeIf = hasTestConfig ? describe : describe.skip;

describeIf('oxo shipper bring label', () => {
  let labelUrl: string | undefined;

  beforeAll(async () => {
    if (!hasTestConfig) {
      console.log(
        '⚠️  Skipping CLI integration tests - missing BRING_API_UID, BRING_API_KEY, or BRING_CUSTOMER_ID',
      );
      return;
    }

    // Create a shipment first to get a label URL
    const result = await runCommand([
      'shipper',
      'bring',
      'create',
      '--correlation-id',
      `test-label-setup-${Date.now()}`,
      '--sender-name',
      'Eventuras AS',
      '--sender-address',
      'Testveien 1',
      '--sender-postal',
      '0001',
      '--sender-city',
      'Oslo',
      '--recipient-name',
      'Test Recipient',
      '--recipient-address',
      'Testgata 42',
      '--recipient-postal',
      '0010',
      '--recipient-city',
      'Oslo',
      '--weight',
      '1000',
      '--length',
      '30',
      '--width',
      '20',
      '--height',
      '10',
      '--json',
    ]);

    if (!result.error && result.stdout) {
      const output = JSON.parse(result.stdout);
      labelUrl = output.labelUrl;
    }
  });

  it('should download label successfully', async () => {
    if (!labelUrl) {
      console.log('⚠️  Skipping test - no label URL available');
      return;
    }

    const outputFile = `test-label-${Date.now()}.pdf`;

    try {
      const result = await runCommand([
        'shipper',
        'bring',
        'label',
        '--label-url',
        labelUrl,
        '--output',
        outputFile,
      ]);

      expect(result.error).toBeUndefined();
      expect(result.stdout).toContain('Label downloaded successfully');
      expect(result.stdout).toContain(outputFile);
      expect(existsSync(outputFile)).toBe(true);
    } finally {
      // Clean up
      if (existsSync(outputFile)) {
        unlinkSync(outputFile);
      }
    }
  });

  it('should output JSON format with --json flag', async () => {
    if (!labelUrl) {
      console.log('⚠️  Skipping test - no label URL available');
      return;
    }

    const outputFile = `test-label-json-${Date.now()}.pdf`;

    try {
      const result = await runCommand([
        'shipper',
        'bring',
        'label',
        '--label-url',
        labelUrl,
        '--output',
        outputFile,
        '--json',
      ]);

      expect(result.error).toBeUndefined();

      const output = JSON.parse(result.stdout);
      expect(output.success).toBe(true);
      expect(output.outputPath).toBe(outputFile);
      expect(output.sizeBytes).toBeGreaterThan(0);
      expect(existsSync(outputFile)).toBe(true);
    } finally {
      // Clean up
      if (existsSync(outputFile)) {
        unlinkSync(outputFile);
      }
    }
  });

  it('should use default filename when --output not specified', async () => {
    if (!labelUrl) {
      console.log('⚠️  Skipping test - no label URL available');
      return;
    }

    const result = await runCommand([
      'shipper',
      'bring',
      'label',
      '--label-url',
      labelUrl,
      '--json',
    ]);

    expect(result.error).toBeUndefined();

    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.outputPath).toMatch(/^label-\d+\.pdf$/);

    // Clean up
    if (existsSync(output.outputPath)) {
      unlinkSync(output.outputPath);
    }
  });

  it('should fail without --label-url argument', async () => {
    const result = await runCommand(['shipper', 'bring', 'label']);

    expect(result.error).toBeDefined();
  });
});
