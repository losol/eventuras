/**
 * Integration tests for Bring API client
 *
 * These tests verify the BringClient implementation by making real API calls
 * to the Bring test environment.
 *
 * Note: These tests require:
 * 1. Valid Bring test credentials in .env file (BRING_API_KEY, BRING_CUSTOMER_ID)
 * 2. The tests create real shipments in Bring's test environment
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { BringClient } from '../bring-v1/client';
import { fetchAccessToken } from '../bring-v1/auth';
import type { BringConsignment } from '../bring-v1/types';
import {
  hasTestConfig,
  getTestConfig,
  generateTestCorrelationId,
  getTestSenderAddress,
  getTestRecipientAddress,
  getTestPackage,
  getTomorrowISODate,
} from './test-utils';

// Skip all tests if configuration is missing
const runTests = hasTestConfig();
const describeIf = runTests ? describe : describe.skip;

describeIf('BringClient Integration Tests', () => {
  const config = runTests ? getTestConfig() : null;
  let client: BringClient;
  let accessToken: string;

  beforeAll(async () => {
    if (!runTests) {
      console.log('⚠️  Skipping Bring integration tests - missing test configuration');
      console.log('   Configure .env with Bring test credentials to enable these tests');
      return;
    }

    console.log(`
      ℹ️  Running Bring integration tests
      API URL: ${config!.apiUrl}
      Customer ID: ${config!.customerId}
    `);

    client = new BringClient(config!);

    // Fetch access token for all tests
    accessToken = await fetchAccessToken(config!);
    expect(accessToken).toBeTruthy();
    expect(accessToken.length).toBeGreaterThan(0);
  });

  /**
   * Helper to create a test consignment
   */
  function createTestConsignment(correlationId: string): BringConsignment {
    return {
      correlationId,
      shippingDateTime: getTomorrowISODate(),
      parties: {
        sender: getTestSenderAddress(),
        recipient: getTestRecipientAddress(),
      },
      product: {
        id: 'SERVICEPAKKE',
        customerNumber: config!.customerId,
      },
      packages: [
        {
          correlationId: `${correlationId}-pkg-1`,
          weight: getTestPackage().weightInGrams,
          dimensions: {
            length: getTestPackage().lengthInCm,
            width: getTestPackage().widthInCm,
            height: getTestPackage().heightInCm,
          },
        },
      ],
    };
  }

  describe('createShipment', () => {
    it('should create a shipment successfully', async () => {
      const correlationId = generateTestCorrelationId('create-shipment');
      const consignment = createTestConsignment(correlationId);

      const response = await client.createShipment(consignment, accessToken);

      // Verify response structure
      expect(response).toBeDefined();
      expect(response.consignments).toBeDefined();
      expect(response.consignments.length).toBe(1);

      const shipment = response.consignments[0];
      expect(shipment.confirmation).toBeDefined();
      expect(shipment.confirmation.consignmentNumber).toBeTruthy();
      expect(shipment.confirmation.links).toBeDefined();
      expect(shipment.confirmation.links.labels).toBeTruthy();

      console.log(`✓ Created shipment: ${shipment.confirmation.consignmentNumber}`);
    });

    it('should include package tracking numbers', async () => {
      const correlationId = generateTestCorrelationId('create-tracking');
      const consignment = createTestConsignment(correlationId);

      const response = await client.createShipment(consignment, accessToken);

      const shipment = response.consignments[0];
      expect(shipment.packages).toBeDefined();
      expect(shipment.packages.length).toBe(1);

      const pkg = shipment.packages[0];
      expect(pkg.trackingNumber).toBeTruthy();
      expect(pkg.statusUrl).toBeTruthy();

      console.log(`✓ Package tracking number: ${pkg.trackingNumber}`);
    });

    it('should handle multiple packages', async () => {
      const correlationId = generateTestCorrelationId('multi-package');
      const consignment = createTestConsignment(correlationId);

      // Add a second package
      consignment.packages.push({
        correlationId: `${correlationId}-pkg-2`,
        weight: getTestPackage().weightInGrams,
        dimensions: {
          length: getTestPackage().lengthInCm,
          width: getTestPackage().widthInCm,
          height: getTestPackage().heightInCm,
        },
      });

      const response = await client.createShipment(consignment, accessToken);

      const shipment = response.consignments[0];
      expect(shipment.packages).toBeDefined();
      expect(shipment.packages.length).toBe(2);

      shipment.packages.forEach((pkg, idx) => {
        expect(pkg.trackingNumber).toBeTruthy();
        console.log(`✓ Package ${idx + 1} tracking number: ${pkg.trackingNumber}`);
      });
    });

    it('should fail with invalid access token', async () => {
      const correlationId = generateTestCorrelationId('invalid-token');
      const consignment = createTestConsignment(correlationId);

      await expect(
        client.createShipment(consignment, 'invalid-token-12345')
      ).rejects.toThrow(/authentication failed/i);
    });
  });

  describe('fetchLabel', () => {
    it('should fetch PDF label successfully', async () => {
      // First create a shipment
      const correlationId = generateTestCorrelationId('fetch-label');
      const consignment = createTestConsignment(correlationId);
      const response = await client.createShipment(consignment, accessToken);

      const labelUrl = response.consignments[0].confirmation.links.labels;
      expect(labelUrl).toBeTruthy();

      // Fetch the label
      const labelData = await client.fetchLabel(labelUrl, accessToken);

      // Verify it's a valid PDF
      expect(labelData).toBeDefined();
      expect(labelData.byteLength).toBeGreaterThan(0);

      // Check PDF magic bytes (should start with %PDF)
      const uint8Array = new Uint8Array(labelData);
      const header = String.fromCharCode(...uint8Array.slice(0, 4));
      expect(header).toBe('%PDF');

      console.log(`✓ Fetched PDF label (${labelData.byteLength} bytes)`);
    });

    it('should fail with invalid label URL', async () => {
      const invalidUrl = 'https://api.qa.bring.com/booking/api/booking/labels/invalid-123';

      await expect(
        client.fetchLabel(invalidUrl, accessToken)
      ).rejects.toThrow(/Failed to fetch/i);
    });

    it('should fail with invalid access token', async () => {
      // Use a valid-looking URL but invalid token
      const url = 'https://api.qa.bring.com/booking/api/booking/labels/test-123';

      await expect(
        client.fetchLabel(url, 'invalid-token-12345')
      ).rejects.toThrow(/authentication failed/i);
    });
  });
});
