/**
 * Integration tests for oxo shipper bring test command
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

describeIf('oxo shipper bring test', () => {
  beforeAll(() => {
    if (!hasTestConfig) {
      console.log('⚠️  Skipping CLI integration tests - missing BRING_CLIENT_ID, BRING_CLIENT_SECRET, or BRING_CUSTOMER_ID');
    }
  });

  it('should test Bring API connection successfully', async () => {
    const { exitCode, stdout } = await runCommand('shipper bring test');

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Bring API connection successful');
    expect(stdout).toContain('API URL:');
    expect(stdout).toContain('Customer ID:');
    expect(stdout).toContain('Client ID:');
    expect(stdout).toContain('Access token length:');
  });

  it('should output JSON format with --json flag', async () => {
    const { exitCode, stdout } = await runCommand('shipper bring test --json');

    expect(exitCode).toBe(0);

    const output = JSON.parse(stdout);
    expect(output.success).toBe(true);
    expect(output.apiUrl).toBeDefined();
    expect(output.customerId).toBeDefined();
    expect(output.clientId).toBeDefined();
    expect(output.tokenLength).toBeGreaterThan(0);
    expect(output.responseTimeMs).toBeGreaterThan(0);
  });
});
