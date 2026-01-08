/**
 * Unit tests for oxo shipper bring create command
 *
 * NOTE: These tests are currently skipped because mocking the shipper library
 * prevents the commands from generating output, making the tests less useful.
 * The integration tests (create.test.ts) provide better coverage by testing
 * the actual command behavior with real API calls.
 *
 * If we want true unit tests, we would need to refactor the commands to separate
 * the business logic from the CLI framework, which is not a priority right now.
 */

import { runCommand } from '@oclif/test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the shipper library
vi.mock('@eventuras/shipper/bring-v1', () => ({
  BringClient: vi.fn().mockImplementation(() => ({
    createShipment: vi.fn().mockResolvedValue({
      consignments: [
        {
          confirmation: {
            consignmentNumber: 'TEST123456789',
            links: {
              labels:
                'https://api.qa.bring.com/booking/api/booking/labels/TEST123',
              tracking: 'https://tracking.bring.com/tracking/TEST123456789',
            },
          },
          correlationId: 'test-correlation-id',
          packages: [
            {
              correlationId: 'test-pkg-1',
              packageNumber: 'PKG123',
            },
          ],
        },
      ],
    }),
  })),
  toBringAddress: vi.fn((addr) => ({
    addressLine: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    contact:
      addr.email || addr.phone
        ? {
            email: addr.email,
            phoneNumber: addr.phone,
          }
        : undefined,
    countryCode: addr.countryCode,
    name: addr.name,
    postalCode: addr.postalCode,
  })),
}));

describe.skip('oxo shipper bring create (unit)', () => {
  beforeEach(() => {
    // Set required env vars for the command
    process.env.BRING_API_UID = 'test@example.com';
    process.env.BRING_API_KEY = 'mock_api_key';
    process.env.BRING_CUSTOMER_ID = 'mock_customer_id';
  });

  const baseArgs = [
    '--recipient-address', 'Testgata 42',
    '--recipient-city', 'Oslo',
    '--recipient-name', 'Test Recipient',
    '--recipient-postal', '0010',
    '--sender-address', 'Testveien 1',
    '--sender-city', 'Oslo',
    '--sender-name', 'Eventuras AS',
    '--sender-postal', '0001',
    'shipper',
    'bring',
    'create',
  ];

  it('should accept all required arguments', async () => {
    // Test that command runs without errors
    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--weight', '1000',
      '--width', '20',
    ]);
  });

  it('should support json output format', async () => {
    const { stdout } = await runCommand([
      ...baseArgs,
      '--height', '10',
      '--json',
      '--length', '30',
      '--weight', '1000',
      '--width', '20',
    ]);

    const output = JSON.parse(stdout);
    expect(output).toHaveProperty('success', true);
    expect(output).toHaveProperty('consignmentNumber');
    expect(output).toHaveProperty('packageNumber');
  });

  it('should support optional sender contact details', async () => {
    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--sender-email', 'test@example.com',
      '--sender-phone', '+4712345678',
      '--weight', '1000',
      '--width', '20',
    ]);

  });

  it('should support optional recipient contact details', async () => {
    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--recipient-email', 'recipient@example.com',
      '--recipient-phone', '+4787654321',
      '--weight', '1000',
      '--width', '20',
    ]);

  });

  it('should support custom product code', async () => {
    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--product', 'PA_DOREN',
      '--weight', '1000',
      '--width', '20',
    ]);

  });

  it('should support custom correlation ID', async () => {
    await runCommand([
      ...baseArgs,
      '--correlation-id', 'custom-correlation-123',
      '--height', '10',
      '--length', '30',
      '--weight', '1000',
      '--width', '20',
    ]);

  });

  it('should support custom shipping date', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]!;

    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--shipping-date', tomorrow,
      '--weight', '1000',
      '--width', '20',
    ]);

  });

  it('should support address line 2 for sender and recipient', async () => {
    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--recipient-address2', 'Apartment 3B',
      '--sender-address2', 'Building 2',
      '--weight', '1000',
      '--width', '20',
    ]);

  });

  it('should support custom country codes', async () => {
    await runCommand([
      ...baseArgs,
      '--height', '10',
      '--length', '30',
      '--recipient-country', 'SE',
      '--sender-country', 'NO',
      '--weight', '1000',
      '--width', '20',
    ]);

  });
});
