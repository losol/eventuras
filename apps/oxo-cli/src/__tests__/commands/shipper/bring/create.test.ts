/**
 * Integration tests for oxo shipper bring create command
 *
 * These tests verify the CLI command works by making real API calls
 * to the Bring test environment.
 *
 * Note: These tests require valid Bring test credentials in .env file
 */

import { runCommand } from '@oclif/test';
import { beforeAll, describe, expect, it } from 'vitest';

// Check if we have required env vars for integration tests
const hasTestConfig = Boolean(process.env.BRING_CLIENT_ID &&
  process.env.BRING_CLIENT_SECRET &&
  process.env.BRING_CUSTOMER_ID);

const describeIf = hasTestConfig ? describe : describe.skip;

describeIf('oxo shipper bring create', () => {
  beforeAll(() => {
    if (!hasTestConfig) {
      console.log('⚠️  Skipping CLI integration tests - missing BRING_CLIENT_ID, BRING_CLIENT_SECRET, or BRING_CUSTOMER_ID');
    }
  });

  const baseArgs = [
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
  ];

  it('should create a shipment successfully', async () => {
    const { exitCode, stdout } = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Shipment created successfully');
    expect(stdout).toContain('Consignment number:');
    expect(stdout).toContain('Tracking number:');
    expect(stdout).toContain('Tracking URL:');
    expect(stdout).toContain('Label URL:');
  });

  it('should output JSON format with --json flag', async () => {
    const { exitCode, stdout } = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
      '--json',
    ]);

    expect(exitCode).toBe(0);

    const output = JSON.parse(stdout);
    expect(output.success).toBe(true);
    expect(output.consignmentNumber).toBeDefined();
    expect(output.trackingNumber).toBeDefined();
    expect(output.trackingUrl).toBeDefined();
    expect(output.labelUrl).toBeDefined();
  });

  it('should support custom correlation ID', async () => {
    const correlationId = `test-cli-${Date.now()}`;

    const { exitCode, stdout } = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
      '--correlation-id',
      correlationId,
      '--json',
    ]);

    expect(exitCode).toBe(0);

    const output = JSON.parse(stdout);
    expect(output.success).toBe(true);
    expect(output.consignmentNumber).toBeDefined();
  });

  it('should support custom product code', async () => {
    const { exitCode, stdout } = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
      '--product',
      'SERVICEPAKKE',
      '--json',
    ]);

    expect(exitCode).toBe(0);

    const output = JSON.parse(stdout);
    expect(output.success).toBe(true);
  });

  it('should fail without required arguments', async () => {
    const { exitCode } = await runCommand(['shipper', 'bring', 'create']);

    // Should exit with error code
    expect(exitCode).toBe(1);
  });
});
