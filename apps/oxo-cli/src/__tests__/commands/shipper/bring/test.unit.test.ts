/**
 * Unit tests for oxo shipper bring test command
 *
 * NOTE: These tests are currently skipped because mocking the shipper library
 * prevents the commands from generating output, making the tests less useful.
 * The integration tests (test.test.ts) provide better coverage by testing
 * the actual command behavior with real API calls.
 */

import { runCommand } from '@oclif/test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the shipper library
vi.mock('@eventuras/shipper/bring-v1', () => ({
  fetchAccessToken: vi.fn().mockResolvedValue({
     
    access_token: 'mock_access_token_1234567890',
     
    expires_in: 3600,
    scope: 'booking',
     
    token_type: 'Bearer',
  }),
}));

describe.skip('oxo shipper bring test (unit)', () => {
  beforeEach(() => {
    // Set required env vars for the command
    process.env.BRING_CLIENT_ID = 'mock_client_id';
    process.env.BRING_CLIENT_SECRET = 'mock_client_secret';
    process.env.BRING_CUSTOMER_ID = 'mock_customer_id';
  });

  it('should successfully test API connectivity with mocked response', async () => {
    const { stdout } = await runCommand(['shipper', 'bring', 'test']);

    expect(stdout).toContain('Bring API connection successful');
    expect(stdout).toContain('Access token length');
  });

  it('should support json output format', async () => {
    const { stdout } = await runCommand([
      '--json',
      'shipper',
      'bring',
      'test',
    ]);

    const output = JSON.parse(stdout);
    expect(output).toHaveProperty('success', true);
    expect(output).toHaveProperty('apiUrl');
    expect(output).toHaveProperty('clientId');
    expect(output).toHaveProperty('customerId');
    expect(output).toHaveProperty('responseTimeMs');
    expect(output).toHaveProperty('tokenLength');
  });

  it('should display correct configuration in json output', async () => {
    const { stdout } = await runCommand(['--json', 'shipper', 'bring', 'test']);

    const output = JSON.parse(stdout);
    expect(output.clientId).toBe('mock_client_id');
    expect(output.customerId).toBe('mock_customer_id');
    expect(output.apiUrl).toMatch(/https:\/\/api.*bring\.com/);
  });

  it('should measure response time', async () => {
    const { stdout } = await runCommand(['--json', 'shipper', 'bring', 'test']);

    const output = JSON.parse(stdout);
    expect(output.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(typeof output.responseTimeMs).toBe('number');
  });

  it('should display token length information', async () => {
    const { stdout } = await runCommand(['--json', 'shipper', 'bring', 'test']);

    const output = JSON.parse(stdout);
    expect(output.tokenLength).toBeGreaterThan(0);
    expect(typeof output.tokenLength).toBe('number');
  });
});
