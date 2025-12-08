/**
 * Vipps ePayment Polling Utilities
 *
 * Utilities for polling payment status according to Vipps guidelines.
 *
 * Vipps Guidelines:
 * - Start polling after 5 seconds
 * - Poll every 2 seconds
 * - Use webhooks as primary mechanism, polling as backup
 *
 * @see https://developer.vippsmobilepay.com/docs/knowledge-base/polling-guidelines/
 */

import type { VippsConfig } from '../vipps-core';
import { getPaymentDetails } from './client';
import type { PaymentDetails, PaymentState } from './types';

/**
 * Polling configuration options
 */
export interface PollingOptions {
  /**
   * Initial delay before starting polling (milliseconds)
   * Default: 5000ms (5 seconds) per Vipps guidelines
   */
  initialDelay?: number;

  /**
   * Interval between poll attempts (milliseconds)
   * Default: 2000ms (2 seconds) per Vipps guidelines
   */
  pollInterval?: number;

  /**
   * Maximum number of poll attempts
   * Default: 60 attempts (2 minutes with 2s interval)
   */
  maxAttempts?: number;

  /**
   * Timeout for the entire polling operation (milliseconds)
   * Default: 120000ms (2 minutes)
   */
  timeout?: number;

  /**
   * Callback invoked after each poll attempt
   */
  onPoll?: (attempt: number, payment: PaymentDetails) => void;
}

/**
 * Result of a polling operation
 */
export interface PollingResult {
  /** Final payment details */
  payment: PaymentDetails;
  /** Number of attempts made */
  attempts: number;
  /** Total time elapsed in milliseconds */
  elapsed: number;
  /** Whether the desired state was reached */
  success: boolean;
}

/**
 * Default polling options following Vipps guidelines
 */
const DEFAULT_OPTIONS: Required<Omit<PollingOptions, 'onPoll'>> = {
  initialDelay: 5000, // 5 seconds
  pollInterval: 2000, // 2 seconds
  maxAttempts: 60, // 2 minutes with 2s interval
  timeout: 120000, // 2 minutes
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll payment status until it reaches a desired state
 *
 * This function follows Vipps polling guidelines:
 * - Initial 5 second delay
 * - Poll every 2 seconds
 * - Timeout after 2 minutes
 *
 * @param config - Vipps configuration
 * @param reference - Payment reference to poll
 * @param desiredStates - State(s) to wait for
 * @param options - Polling configuration options
 * @returns Polling result with final payment details
 *
 * @example
 * ```typescript
 * // Poll until payment is authorized or terminated
 * const result = await pollPaymentStatus(config, reference, ['AUTHORIZED', 'TERMINATED']);
 *
 * if (result.success && result.payment.state === 'AUTHORIZED') {
 *   console.log('Payment authorized!');
 * }
 * ```
 */
export async function pollPaymentStatus(
  config: VippsConfig,
  reference: string,
  desiredStates: PaymentState | PaymentState[],
  options: PollingOptions = {}
): Promise<PollingResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const states = Array.isArray(desiredStates) ? desiredStates : [desiredStates];
  const startTime = Date.now();

  // Initial delay per Vipps guidelines
  await sleep(opts.initialDelay);

  let attempts = 0;
  let payment: PaymentDetails | null = null;

  while (attempts < opts.maxAttempts) {
    const elapsed = Date.now() - startTime;

    // Check timeout
    if (elapsed >= opts.timeout) {
      throw new Error(
        `Polling timeout after ${elapsed}ms (${attempts} attempts). Payment state: ${payment?.state || 'unknown'}`
      );
    }

    attempts++;

    // Poll payment status
    payment = await getPaymentDetails(config, reference);

    // Invoke callback if provided
    if (options.onPoll) {
      options.onPoll(attempts, payment);
    }

    // Check if desired state reached
    if (states.includes(payment.state)) {
      return {
        payment,
        attempts,
        elapsed: Date.now() - startTime,
        success: true,
      };
    }

    // Check if payment is in a terminal state that won't change
    const terminalStates: PaymentState[] = ['TERMINATED', 'ABORTED', 'EXPIRED'];
    if (terminalStates.includes(payment.state) && !states.includes(payment.state)) {
      return {
        payment,
        attempts,
        elapsed: Date.now() - startTime,
        success: false,
      };
    }

    // Wait before next attempt
    await sleep(opts.pollInterval);
  }

  throw new Error(
    `Max polling attempts (${opts.maxAttempts}) reached. Payment state: ${payment?.state || 'unknown'}`
  );
}

/**
 * Poll until payment is authorized
 *
 * Convenience function for the common use case of waiting for authorization.
 *
 * @param config - Vipps configuration
 * @param reference - Payment reference
 * @param options - Polling options
 * @returns Polling result
 *
 * @example
 * ```typescript
 * const result = await pollUntilAuthorized(config, reference);
 * if (result.success) {
 *   console.log('Payment authorized!');
 * }
 * ```
 */
export async function pollUntilAuthorized(
  config: VippsConfig,
  reference: string,
  options?: PollingOptions
): Promise<PollingResult> {
  return pollPaymentStatus(config, reference, 'AUTHORIZED', options);
}

/**
 * Poll until payment reaches a terminal state
 *
 * Terminal states are: AUTHORIZED, TERMINATED, ABORTED, EXPIRED
 *
 * @param config - Vipps configuration
 * @param reference - Payment reference
 * @param options - Polling options
 * @returns Polling result
 *
 * @example
 * ```typescript
 * const result = await pollUntilTerminal(config, reference);
 * console.log('Final state:', result.payment.state);
 * ```
 */
export async function pollUntilTerminal(
  config: VippsConfig,
  reference: string,
  options?: PollingOptions
): Promise<PollingResult> {
  return pollPaymentStatus(
    config,
    reference,
    ['AUTHORIZED', 'TERMINATED', 'ABORTED', 'EXPIRED'],
    options
  );
}
