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
const hasTestConfig = Boolean(process.env.BRING_CLIENT_ID &&
  process.env.BRING_CLIENT_SECRET &&
  process.env.BRING_CUSTOMER_ID);

const describeIf = hasTestConfig ? describe : describe.skip;

describeIf('oxo shipper bring label', () => {
  let labelUrl: string | undefined;

  beforeAll(async () => {
    if (!hasTestConfig) {
      console.log('⚠️  Skipping CLI integration tests - missing BRING_CLIENT_ID, BRING_CLIENT_SECRET, or BRING_CUSTOMER_ID');
      return;
    }

    // Create a shipment first to get a label URL
    const { stdout } = await runCommand([
      'shipper',
      'bring',
      'create',
      '--sender-name', 'Eventuras AS',
      '--sender-address', 'Testveien 1',
      '--sender-postal', '0001',
      '--sender-city', 'Oslo',
      '--recipient-name', 'Test Recipient',
      '--recipient-address', 'Testgata 42',
      '--recipient-postal', '0010',
      '--recipient-city', 'Oslo',
      '--weight', '1000',
      '--length', '30',
      '--width', '20',
      '--height', '10',
      '--json',
    ]);

    const output = JSON.parse(stdout);
    labelUrl = output.labelUrl;
  });

  it('should download label successfully', async () => {
    if (!labelUrl) {
      console.log('⚠️  Skipping test - no label URL available');
      return;
    }

    const outputFile = `test-label-${Date.now()}.pdf`;

    try {
      const { exitCode, stdout } = await runCommand([
        'shipper',
        'bring',
        'label',
        '--label-url',
        labelUrl,
        '--output',
        outputFile,
      ]);

      expect(exitCode).toBe(0);
      expect(stdout).toContain('Label downloaded successfully');
      expect(stdout).toContain(outputFile);
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
      const { exitCode, stdout } = await runCommand([
        'shipper',
        'bring',
        'label',
        '--label-url',
        labelUrl,
        '--output',
        outputFile,
        '--json',
      ]);

      expect(exitCode).toBe(0);

      const output = JSON.parse(stdout);
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

    const { exitCode, stdout } = await runCommand([
      'shipper',
      'bring',
      'label',
      '--label-url',
      labelUrl,
      '--json',
    ]);

    expect(exitCode).toBe(0);

    const output = JSON.parse(stdout);
    expect(output.success).toBe(true);
    expect(output.outputPath).toMatch(/^label-\d+\.pdf$/);

    // Clean up
    if (existsSync(output.outputPath)) {
      unlinkSync(output.outputPath);
    }
  });

  it('should fail with invalid label URL', async () => {
    const { exitCode } = await runCommand([
      'shipper',
      'bring',
      'label',
      '--label-url',
      'https://api.qa.bring.com/booking/api/booking/labels/invalid-url',
    ]);

    expect(exitCode).toBe(1);
  });

  it('should fail without --label-url argument', async () => {
    const { exitCode } = await runCommand(['shipper', 'bring', 'label']);

    expect(exitCode).toBe(1);
  });
});
