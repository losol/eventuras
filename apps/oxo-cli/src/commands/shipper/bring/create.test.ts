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
const hasTestConfig = Boolean(process.env.BRING_API_UID &&
  process.env.BRING_API_KEY &&
  process.env.BRING_CUSTOMER_ID);

const describeIf = hasTestConfig ? describe : describe.skip;

describeIf('oxo shipper bring create', () => {
  beforeAll(() => {
    if (!hasTestConfig) {
      console.log('⚠️  Skipping CLI integration tests - missing BRING_API_UID, BRING_API_KEY, or BRING_CUSTOMER_ID');
    }
  });

  const baseArgs = [
    '--correlation-id', `test-cli-${Date.now()}`,
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
    const result = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
    ]);

    expect(result.error).toBeUndefined();
    expect(result.stdout).toContain('Shipment created successfully');
    expect(result.stdout).toContain('Consignment number:');
    expect(result.stdout).toContain('Tracking URL:');
  });

  it('should output JSON format with --json flag', async () => {
    const result = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
      '--json',
    ]);

    expect(result.error).toBeUndefined();

    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.consignmentNumber).toBeDefined();
    expect(output.trackingUrl).toBeDefined();
  });

  it('should support custom correlation ID', async () => {
    const correlationId = `test-cli-custom-${Date.now()}`;

    const result = await runCommand([
      'shipper',
      'bring',
      'create',
      '--correlation-id',
      correlationId,
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

    expect(result.error).toBeUndefined();

    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.consignmentNumber).toBeDefined();
  });

  it('should support custom product code', async () => {
    const result = await runCommand([
      'shipper',
      'bring',
      'create',
      ...baseArgs,
      '--product',
      'SERVICEPAKKE',
      '--json',
    ]);

    expect(result.error).toBeUndefined();

    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
  });

  it('should fail without required arguments', async () => {
    const result = await runCommand(['shipper', 'bring', 'create']);

    // Should have error
    expect(result.error).toBeDefined();
  });
});
