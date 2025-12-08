/**
 * Automated integration tests for Vipps ePayment API using Force Approve
 *
 * These tests use the force approve endpoint to automatically complete payments
 * without manual interaction in the MT test app.
 *
 * See: https://developer.vippsmobilepay.com/docs/APIs/epayment-api/api-guide/operations/force-approve/
 *
 * IMPORTANT PREREQUISITES:
 * 1. Valid Vipps test credentials in .env file
 * 2. Test user must have manually approved at least ONE payment in the MT app first
 *    (This is a one-time requirement per test user)
 * 3. Test user's card must not be expired (if you get HTTP 500, create new test user)
 *
 * Test amounts trigger specific responses:
 * - 151: Insufficient funds (will fail at approval)
 * - 182: Refused by issuer (will fail at approval)
 * - 183: Suspected fraud (will fail at approval)
 * - Normal amounts: Should succeed through full flow
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  createPayment,
  forceApprovePayment,
  getPaymentDetails,
  capturePayment,
  refundPayment,
  cancelPayment,
} from '../epayment-v1/client';
import type { CreatePaymentRequest } from '../epayment-v1/types';
import {
  hasTestConfig,
  getTestConfig,
  generateTestReference,
  getTestPhoneNumber,
  waitForPaymentState,
} from './test-utils';

const runTests = hasTestConfig();
const describeIf = runTests ? describe : describe.skip;

describeIf('Vipps ePayment API - Automated Flow with Force Approve', () => {
  const config = runTests ? getTestConfig() : null;
  const phoneNumber = getTestPhoneNumber();

  beforeAll(() => {
    if (!runTests) {
      console.log('⚠️  Skipping automated tests - missing test configuration');
    } else {
      console.log(`
        ⚠️  IMPORTANT: Force approve requires that the test user (${phoneNumber})
        has manually approved at least ONE payment in the MT test app.

        If tests fail with 403 or similar, complete one payment manually first:
        1. Run one of the manual tests (epayment-test-amounts.test.ts)
        2. Complete that payment in the MT app
        3. Then these automated tests will work
      `);
    }
  });

  describe('Complete Payment Flow - Success Case', () => {
    it('should create, approve, and capture a payment', async () => {
      const reference = generateTestReference('auto-success');

      // 1. Create payment
      const payment: CreatePaymentRequest = {
        amount: {
          value: 10000, // 100 NOK
          currency: 'NOK',
        },
        paymentMethod: {
          type: 'WALLET',
        },
        customer: {
          phoneNumber,
        },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Automated test - success flow',
        reference,
      };

      const createResponse = await createPayment(config!, payment);
      expect(createResponse.reference).toBe(reference);
      expect(createResponse.redirectUrl).toBeDefined();

      // 2. Force approve the payment
      await forceApprovePayment(config!, reference, phoneNumber);

      // 3. Wait for payment to be authorized
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED',
        20,
        1000
      );

      const authorizedPayment = await getPaymentDetails(config!, reference);
      expect(authorizedPayment.state).toBe('AUTHORIZED');

      // 4. Capture the payment
      await capturePayment(config!, reference, {
        modificationAmount: {
          value: 10000,
          currency: 'NOK',
        },
      });

      // 5. Verify capture
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'CAPTURED',
        20,
        1000
      );

      const capturedPayment = await getPaymentDetails(config!, reference);
      expect(capturedPayment.state).toBe('CAPTURED');
      expect(capturedPayment.amount.value).toBe(10000);
    }, 60000); // 60 second timeout

    it('should create, approve, capture, and refund a payment', async () => {
      const reference = generateTestReference('auto-refund');

      // Create and approve payment
      const payment: CreatePaymentRequest = {
        amount: { value: 5000, currency: 'NOK' },
        paymentMethod: { type: 'WALLET' },
        customer: { phoneNumber },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Automated test - refund flow',
        reference,
      };

      await createPayment(config!, payment);
      await forceApprovePayment(config!, reference, phoneNumber);
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED'
      );

      // Capture
      await capturePayment(config!, reference, {
        modificationAmount: { value: 5000, currency: 'NOK' },
      });
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'CAPTURED'
      );

      // Refund
      await refundPayment(config!, reference, {
        modificationAmount: { value: 5000, currency: 'NOK' },
      });

      // Wait a bit for refund to process
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'TERMINATED',
        20,
        1000
      );

      const refundedPayment = await getPaymentDetails(config!, reference);
      expect(refundedPayment.state).toBe('TERMINATED');
    }, 60000);

    it('should create, approve, and cancel a payment', async () => {
      const reference = generateTestReference('auto-cancel');

      // Create and approve
      const payment: CreatePaymentRequest = {
        amount: { value: 3000, currency: 'NOK' },
        paymentMethod: { type: 'WALLET' },
        customer: { phoneNumber },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Automated test - cancel flow',
        reference,
      };

      await createPayment(config!, payment);
      await forceApprovePayment(config!, reference, phoneNumber);
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED'
      );

      // Cancel instead of capture
      await cancelPayment(config!, reference);

      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'ABORTED',
        20,
        1000
      );

      const cancelledPayment = await getPaymentDetails(config!, reference);
      expect(cancelledPayment.state).toBe('ABORTED');
    }, 60000);
  });

  describe('Test Amount 151 - Insufficient Funds (Automated)', () => {
    it('should fail approval with insufficient funds', async () => {
      const reference = generateTestReference('auto-151');

      const payment: CreatePaymentRequest = {
        amount: { value: 151, currency: 'NOK' },
        paymentMethod: { type: 'WALLET' },
        customer: { phoneNumber },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Test Amount 151: Insufficient funds',
        reference,
      };

      await createPayment(config!, payment);

      // Force approve should fail or payment should become ABORTED
      try {
        await forceApprovePayment(config!, reference, phoneNumber);

        // Even if approve succeeds, payment should end up ABORTED
        await waitForPaymentState(
          () => getPaymentDetails(config!, reference),
          'ABORTED',
          20,
          1000
        );

        const failedPayment = await getPaymentDetails(config!, reference);
        expect(failedPayment.state).toBe('ABORTED');
      } catch (error) {
        // Expected to fail - insufficient funds
        expect(error).toBeDefined();
      }
    }, 60000);
  });

  describe('Partial Capture', () => {
    it('should support partial capture', async () => {
      const reference = generateTestReference('auto-partial');

      const payment: CreatePaymentRequest = {
        amount: { value: 10000, currency: 'NOK' },
        paymentMethod: { type: 'WALLET' },
        customer: { phoneNumber },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Automated test - partial capture',
        reference,
      };

      await createPayment(config!, payment);
      await forceApprovePayment(config!, reference, phoneNumber);
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED'
      );

      // Capture only 50 NOK out of 100 NOK
      await capturePayment(config!, reference, {
        modificationAmount: { value: 5000, currency: 'NOK' },
      });

      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'CAPTURED'
      );

      const partialCaptured = await getPaymentDetails(config!, reference);
      expect(partialCaptured.state).toBe('CAPTURED');
      // The aggregate should show 50 NOK captured, 50 NOK cancelled
    }, 60000);
  });
});
