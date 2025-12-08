'use server';

import { actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { getCurrentSession } from '@eventuras/fides-auth-next';
import { Logger } from '@eventuras/logger';
import { getPaymentDetails, type PaymentDetails } from '@eventuras/vipps/epayment-v1';

import { getVippsConfig } from '@/lib/vipps/config';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'checkPaymentActions' },
});

/**
 * Check if there's a pending payment for the current cart
 *
 * This is useful when user returns to checkout page after starting a payment
 * but didn't complete it or got lost along the way.
 *
 * @returns Payment details if there's a pending/authorized payment, null otherwise
 */
export async function checkPendingPayment(): Promise<
  ServerActionResult<PaymentDetails | null>
> {
  try {
    const session = await getCurrentSession();
    const cart = session?.data?.cart;

    if (!cart?.paymentReference) {
      logger.info('No payment reference in cart');
      return actionSuccess(null);
    }

    const reference = cart.paymentReference;

    logger.info({ reference }, 'Checking payment status for cart');

    const vippsConfig = getVippsConfig();
    const paymentDetails = await getPaymentDetails(vippsConfig, reference);

    logger.info(
      {
        reference,
        state: paymentDetails.state,
      },
      'Payment status checked',
    );

    // Only return payment if it's in a state where user can continue
    if (
      paymentDetails.state === 'CREATED' ||
      paymentDetails.state === 'AUTHORIZED'
    ) {
      return actionSuccess(paymentDetails);
    }

    // Payment is in terminal state (ABORTED, EXPIRED, TERMINATED), allow new payment
    logger.info(
      { reference, state: paymentDetails.state },
      'Payment is in terminal state, can create new payment',
    );
    return actionSuccess(null);
  } catch (error) {
    // If payment not found or error, allow new payment
    logger.warn(
      {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'Error checking pending payment, will allow new payment',
    );
    return actionSuccess(null);
  }
}
