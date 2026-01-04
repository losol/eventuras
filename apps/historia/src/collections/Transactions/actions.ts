'use server';

import { getPayload } from 'payload';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import { getPaymentDetails } from '@eventuras/vipps/epayment-v1';

import { getVippsConfig } from '@/lib/vipps/config';
import config from '@/payload.config';

const logger = Logger.create({
  namespace: 'historia:transactions',
  context: { module: 'actions' },
});

/**
 * Fetch and update payment details from Vipps for a transaction
 */
export async function updateTransactionDetails(
  transactionId: string
): Promise<ServerActionResult<void>> {
  try {
    logger.info({ transactionId }, 'Fetching payment details from Vipps');

    const payloadInstance = await getPayload({ config });

    // Get the transaction
    const transaction = await payloadInstance.findByID({
      collection: 'transactions',
      id: transactionId,
    });

    if (!transaction) {
      logger.error({ transactionId }, 'Transaction not found');
      return actionError('Transaction not found');
    }

    // Only fetch details for Vipps payments
    if (transaction.paymentMethod !== 'vipps') {
      logger.warn(
        { transactionId, paymentMethod: transaction.paymentMethod },
        'Can only fetch details for Vipps payments'
      );
      return actionError('Can only fetch details for Vipps payments');
    }

    // Fetch payment details from Vipps
    const vippsConfig = getVippsConfig();
    const paymentDetails = await getPaymentDetails(
      vippsConfig,
      transaction.paymentReference
    );

    if (!paymentDetails) {
      logger.error(
        { transactionId, reference: transaction.paymentReference },
        'Failed to fetch payment details from Vipps'
      );
      return actionError('Failed to fetch payment details from Vipps');
    }

    logger.info(
      {
        transactionId,
        reference: transaction.paymentReference,
        state: paymentDetails.state,
        hasUserDetails: !!paymentDetails.userDetails,
        hasShipping: !!paymentDetails.shippingDetails,
      },
      'Retrieved payment details from Vipps'
    );

    // Try to find customer by email if not already set
    let customerId = transaction.customer;
    if (paymentDetails.userDetails?.email && !customerId) {
      try {
        const users = await payloadInstance.find({
          collection: 'users',
          where: {
            email: {
              equals: paymentDetails.userDetails.email,
            },
          },
          limit: 1,
        });

        if (users.docs.length > 0) {
          customerId = users.docs[0].id;
          logger.info(
            {
              userId: customerId,
              email: paymentDetails.userDetails.email,
              transactionId,
            },
            'Found and will link existing user from Vipps email'
          );
        }
      } catch (error) {
        logger.warn(
          {
            error,
            email: paymentDetails.userDetails?.email,
            transactionId,
          },
          'Failed to lookup user by email'
        );
      }
    }

    // Update transaction with payment details and status
    await payloadInstance.update({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: paymentDetails.state.toLowerCase(),
        data: paymentDetails as any,
        ...(customerId && { customer: customerId }),
      },
    });

    logger.info(
      { transactionId, newStatus: paymentDetails.state },
      'Successfully updated transaction with payment details and status'
    );

    return actionSuccess(undefined, 'Payment details updated successfully');
  } catch (error) {
    logger.error(
      {
        error,
        transactionId,
      },
      'Error updating transaction details'
    );
    return actionError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
