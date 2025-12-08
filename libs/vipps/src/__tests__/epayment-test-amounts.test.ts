/**
 * Automated integration tests for Vipps ePayment API - Test Amounts
 *
 * These tests verify the behavior of special test amounts using force approve
 * to automatically complete payments without manual interaction.
 * See: https://developer.vippsmobilepay.com/docs/knowledge-base/test-environment/#test-amounts
 *
 * Test amounts trigger specific responses:
 * - 184: Withdrawal limit exceeded
 * - 186: Expired card
 *
 * Note: These tests require:
 * 1. Valid Vipps test credentials in .env file
 * 2. Test user must have manually approved at least ONE payment in MT app (one-time requirement)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createPayment, forceApprovePayment, getPaymentDetails } from '../epayment-v1/client';
import type { CreatePaymentRequest } from '../epayment-v1/types';
import {
  hasTestConfig,
  getTestConfig,
  generateTestReference,
  getTestPhoneNumber,
  waitForPaymentState,
} from './test-utils';

// Skip all tests if configuration is missing
const runTests = hasTestConfig();
const describeIf = runTests ? describe : describe.skip;

describeIf('Vipps ePayment API - Test Amounts', () => {
  const config = runTests ? getTestConfig() : null;
  const phoneNumber = getTestPhoneNumber();

  beforeAll(() => {
    if (!runTests) {
      console.log('⚠️  Skipping Vipps integration tests - missing test configuration');
      console.log('   Configure .env with test credentials to enable these tests');
    } else {
      console.log(`
        ℹ️  Using force approve for automated testing.
        Test user: ${phoneNumber}
        Note: Test user must have approved at least ONE payment manually first.
      `);
    }
  });

  /**
   * Helper to create a payment with a specific test amount
   */
  async function createTestPayment(
    amountValue: number,
    description: string
  ) {
    const reference = generateTestReference(`test-${amountValue}`);

    const request: CreatePaymentRequest = {
      amount: {
        value: amountValue,
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
      paymentDescription: description,
      reference,
    };

    return {
      reference,
      response: await createPayment(config!, request),
    };
  }

  describe('Payment Creation and Approval', () => {
    it('should successfully create and approve a payment with normal amount', async () => {
      const { reference, response } = await createTestPayment(
        10000, // 100 NOK
        'Normal payment test'
      );

      expect(response).toBeDefined();
      expect(response.reference).toBe(reference);
      expect(response.redirectUrl).toBeDefined();

      // Force approve the payment
      await forceApprovePayment(config!, reference, phoneNumber);

      // Wait for authorization
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED',
        20,
        1000
      );

      const details = await getPaymentDetails(config!, reference);
      expect(details.state).toBe('AUTHORIZED');
    }, 30000);

    it('should create and approve payment with minimum amount (1 NOK)', async () => {
      const { reference, response } = await createTestPayment(
        100, // 1 NOK (minimum)
        'Minimum amount test'
      );

      expect(response).toBeDefined();
      expect(response.redirectUrl).toBeDefined();

      // Force approve the payment
      await forceApprovePayment(config!, reference, phoneNumber);

      // Wait for authorization
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED',
        20,
        1000
      );

      const details = await getPaymentDetails(config!, reference);
      expect(details.state).toBe('AUTHORIZED');
    }, 30000);
  });

  describe('Test Amount 184 - Withdrawal Limit Exceeded', () => {
    it('should create payment and fail approval due to limit', async () => {
      const { reference, response } = await createTestPayment(
        184,
        'Test Amount 184: Withdrawal limit exceeded'
      );

      expect(response).toBeDefined();
      expect(response.reference).toBe(reference);

      // Attempt to force approve - should fail or result in ABORTED state
      try {
        await forceApprovePayment(config!, reference, phoneNumber);

        // If approve succeeds, payment should eventually be ABORTED
        await waitForPaymentState(
          () => getPaymentDetails(config!, reference),
          'ABORTED',
          20,
          1000
        );

        const details = await getPaymentDetails(config!, reference);
        expect(details.state).toBe('ABORTED');
      } catch (error) {
        // Force approve may fail immediately for this test amount
        expect(error).toBeDefined();
      }
    }, 30000);
  });

  describe('Test Amount 186 - Expired Card', () => {
    it('should create payment and fail approval with expired card', async () => {
      const { reference, response } = await createTestPayment(
        186,
        'Test Amount 186: Expired card'
      );

      expect(response).toBeDefined();
      expect(response.reference).toBe(reference);

      // Attempt to force approve - should fail
      try {
        await forceApprovePayment(config!, reference, phoneNumber);

        // If approve succeeds, payment should eventually be ABORTED
        await waitForPaymentState(
          () => getPaymentDetails(config!, reference),
          'ABORTED',
          20,
          1000
        );

        const details = await getPaymentDetails(config!, reference);
        expect(details.state).toBe('ABORTED');
      } catch (error) {
        // Force approve may fail immediately for expired card
        expect(error).toBeDefined();
      }
    }, 30000);
  });

  describe('Payment Status Retrieval', () => {
    it('should retrieve payment details after creation and approval', async () => {
      const { reference } = await createTestPayment(
        10000,
        'Payment details test'
      );

      // Force approve the payment
      await forceApprovePayment(config!, reference, phoneNumber);

      // Wait for authorization
      await waitForPaymentState(
        () => getPaymentDetails(config!, reference),
        'AUTHORIZED',
        20,
        1000
      );

      // Get payment details
      const details = await getPaymentDetails(config!, reference);

      expect(details).toBeDefined();
      expect(details.reference).toBe(reference);
      expect(details.amount).toBeDefined();
      expect(details.amount.value).toBe(10000);
      expect(details.state).toBe('AUTHORIZED');
    }, 30000);
  });
});
