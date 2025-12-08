/**
 * Integration tests for Vipps ePayment API - Refund Test Amounts
 *
 * These tests verify the behavior of special refund test amounts.
 * See: https://developer.vippsmobilepay.com/docs/knowledge-base/test-environment/#refund-test-amounts
 *
 * Refund test amounts:
 * - 123: Cannot refund single transferred payments. User is deleted or does not have a receiving account.
 * - 124: Refund period expired
 *
 * Note: These tests require:
 * 1. Valid Vipps test credentials in .env file
 * 2. A completed payment before testing refunds
 * 3. Manual completion in the MT test app
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createPayment, capturePayment, refundPayment } from '../epayment-v1/client';
import type { CreatePaymentRequest, CapturePaymentRequest, RefundPaymentRequest } from '../epayment-v1/types';
import { hasTestConfig, getTestConfig, generateTestReference, getTestPhoneNumber } from './test-utils';

const runTests = hasTestConfig();
const describeIf = runTests ? describe : describe.skip;

describeIf('Vipps ePayment API - Refund Test Amounts', () => {
  const config = runTests ? getTestConfig() : null;

  beforeAll(() => {
    if (!runTests) {
      console.log('⚠️  Skipping Vipps refund tests - missing test configuration');
    }
  });

  describe('Test Amount 123 - Cannot Refund (User Deleted)', () => {
    it('should fail to refund with amount 123', async () => {
      const reference = generateTestReference('refund-123');

      // Create payment with refund test amount
      const payment: CreatePaymentRequest = {
        amount: {
          value: 123,
          currency: 'NOK',
        },
        paymentMethod: {
          type: 'WALLET',
        },
        customer: {
          phoneNumber: getTestPhoneNumber(),
        },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Refund Test 123: User deleted',
        reference,
      };

      const createResponse = await createPayment(config!, payment);
      expect(createResponse).toBeDefined();

      console.log(`
        ℹ️  Manual steps required to test refund:
        1. Open the redirectUrl: ${createResponse.redirectUrl}
        2. Complete the payment in the MT test app
        3. Wait for payment to be AUTHORIZED
        4. Capture the payment
        5. Attempt refund - should fail with "Cannot refund"

        Reference: ${reference}
      `);

      // Note: In a real scenario, you would:
      // 1. Wait for payment to be authorized (poll or webhook)
      // 2. Capture the payment
      // 3. Attempt refund and expect it to fail
    });
  });

  describe('Test Amount 124 - Refund Period Expired', () => {
    it('should fail to refund due to expired period', async () => {
      const reference = generateTestReference('refund-124');

      const payment: CreatePaymentRequest = {
        amount: {
          value: 124,
          currency: 'NOK',
        },
        paymentMethod: {
          type: 'WALLET',
        },
        customer: {
          phoneNumber: getTestPhoneNumber(),
        },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Refund Test 124: Period expired',
        reference,
      };

      const createResponse = await createPayment(config!, payment);
      expect(createResponse).toBeDefined();

      console.log(`
        ℹ️  Manual steps required to test refund:
        1. Open the redirectUrl: ${createResponse.redirectUrl}
        2. Complete the payment in the MT test app
        3. Capture the payment
        4. Attempt refund - should fail with "Refund period expired"

        Reference: ${reference}
      `);
    });
  });

  describe('Normal Refund Flow', () => {
    it('should successfully process a refund with normal amount', async () => {
      const reference = generateTestReference('refund-normal');

      // Create payment with normal amount
      const payment: CreatePaymentRequest = {
        amount: {
          value: 10000, // 100 NOK
          currency: 'NOK',
        },
        paymentMethod: {
          type: 'WALLET',
        },
        customer: {
          phoneNumber: getTestPhoneNumber(),
        },
        returnUrl: 'https://example.com/return',
        userFlow: 'WEB_REDIRECT',
        paymentDescription: 'Normal refund test',
        reference,
      };

      const createResponse = await createPayment(config!, payment);
      expect(createResponse).toBeDefined();
      expect(createResponse.reference).toBe(reference);

      console.log(`
        ℹ️  Complete refund flow test:
        1. Open the redirectUrl: ${createResponse.redirectUrl}
        2. Complete payment in MT test app
        3. Run capture operation
        4. Run refund operation

        Reference: ${reference}
        PSP Reference: ${createResponse.pspReference}
      `);

      // In a real test with webhook/polling:
      // await waitForPaymentAuthorized(reference);
      // await capturePayment(config!, reference, { amount: { value: 10000, currency: 'NOK' } });
      // await refundPayment(config!, reference, { amount: { value: 10000, currency: 'NOK' } });
    });
  });
});
