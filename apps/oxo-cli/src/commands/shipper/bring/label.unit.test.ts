/**
 * Unit tests for oxo shipper bring label command
 *
 * NOTE: These tests are currently skipped because mocking the shipper library
 * prevents the commands from generating output, making the tests less useful.
 * The integration tests (label.test.ts) provide better coverage by testing
 * the actual command behavior with real API calls.
 */

import { runCommand } from '@oclif/test';
import { existsSync, unlinkSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the shipper library
vi.mock('@eventuras/shipper/bring-v1', () => ({
  BringClient: vi.fn().mockImplementation(() => ({
    fetchLabel: vi.fn().mockResolvedValue(
      // Mock PDF data
      new ArrayBuffer(1024),
    ),
  })),
}));

describe.skip('oxo shipper bring label (unit)', () => {
  const mockLabelUrl = 'https://api.qa.bring.com/booking/api/booking/labels/MOCK123';
  const createdFiles: string[] = [];

  beforeEach(() => {
    // Set required env vars for the command
    process.env.BRING_API_UID = 'test@example.com';
    process.env.BRING_API_KEY = 'mock_api_key';
    process.env.BRING_CUSTOMER_ID = 'mock_customer_id';
    process.env.BRING_ENVIRONMENT = 'test';
  });

  afterEach(() => {
    // Clean up any created test files
    for (const file of createdFiles) {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }

    createdFiles.length = 0;
  });

  it('should download label with default filename', async () => {
    const { stdout } = await runCommand([
      '--label-url',
      mockLabelUrl,
      'shipper',
      'bring',
      'label',
    ]);

    expect(stdout).toContain('Label downloaded successfully');
    expect(stdout).toMatch(/label-\d+\.pdf/);

    // Track created file for cleanup
    const match = stdout.match(/label-(\d+)\.pdf/);
    if (match) {
      createdFiles.push(match[0]);
    }
  });

  it('should support custom output filename', async () => {
    const customFilename = 'test-label-unit.pdf';
    createdFiles.push(customFilename);

    const { stdout } = await runCommand([
      '--label-url',
      mockLabelUrl,
      '--output',
      customFilename,
      'shipper',
      'bring',
      'label',
    ]);

    expect(stdout).toContain(customFilename);
  });

  it('should support json output format', async () => {
    const { stdout } = await runCommand([
      '--json',
      '--label-url',
      mockLabelUrl,
      'shipper',
      'bring',
      'label',
    ]);

    const output = JSON.parse(stdout);
    expect(output).toHaveProperty('success', true);
    expect(output).toHaveProperty('outputPath');
    expect(output).toHaveProperty('sizeBytes');

    // Track created file for cleanup
    if (output.outputPath) {
      createdFiles.push(output.outputPath);
    }
  });

  it('should report file size in json output', async () => {
    const { stdout } = await runCommand([
      '--json',
      '--label-url',
      mockLabelUrl,
      'shipper',
      'bring',
      'label',
    ]);

    const output = JSON.parse(stdout);
    expect(output.sizeBytes).toBe(1024); // Mock ArrayBuffer size
    expect(typeof output.sizeBytes).toBe('number');

    // Track created file for cleanup
    if (output.outputPath) {
      createdFiles.push(output.outputPath);
    }
  });

  it('should accept full Bring label URLs', async () => {
    await runCommand([
      '--label-url',
      'https://api.bring.com/booking/api/booking/labels/PROD123456',
      'shipper',
      'bring',
      'label',
    ]);

  });

  it('should support short output flag', async () => {
    const customFilename = 'test-label-short-flag.pdf';
    createdFiles.push(customFilename);

    const { stdout } = await runCommand([
      '-o',
      customFilename,
      '--label-url',
      mockLabelUrl,
      'shipper',
      'bring',
      'label',
    ]);

    expect(stdout).toContain(customFilename);
  });
});
