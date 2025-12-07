'use server';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { setCartPaymentReference } from '@/app/actions/cart';
import { publicEnv } from '@/config';
import {
  createPayment,
  type CreatePaymentRequest,
  type CreatePaymentResponse,
} from '@/lib/vipps/epayment-client';
import type { Product } from '@/payload-types';
import { getMeUser } from '@/utilities/getMeUser';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'vippsEPaymentActions' },
});

interface CreateVippsPaymentParams {
  amount: number; // in minor units (øre)
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  products?: Product[]; // Optional: product details for order summary
  userLanguage?: string;
}

/**
 * Create Vipps ePayment (WEB_REDIRECT flow)
 * Uses the new ePayment API instead of the old Checkout API
 */
export async function createVippsPayment({
  amount,
  currency,
  items,
  products,
  userLanguage = 'no',
}: CreateVippsPaymentParams): Promise<ServerActionResult<CreatePaymentResponse>> {
  try {
    logger.info({ amount, currency, items }, 'Creating Vipps ePayment');

    // Try to get current user for phone number (optional)
    let phoneNumber: string | undefined;
    try {
      const userResult = await getMeUser();
      phoneNumber = userResult?.user?.phone_number ?? undefined;
      if (phoneNumber) {
        logger.info({ userId: userResult?.user?.id }, 'Got user phone for payment');
      }
    } catch (error) {
      logger.debug({ error }, 'No user session found, skipping phone pre-fill');
    }

    // Generate unique payment reference
    const reference = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    logger.info({ reference }, 'Generated new payment reference');

    // Build payment description
    const productNames = products?.map(p => p.title).join(', ') || 'Produkter';
    const paymentDescription = products && products.length > 0
      ? `Kjøp: ${productNames.substring(0, 100)}`
      : `Ordre ${reference}`;

    // Build order lines if products are provided
    const orderLines = products?.map((product) => {
      const item = items.find(i => i.productId === product.id);
      if (!item) return null;

      const unitPrice = (product.price?.amount || 0) * 100; // Convert to øre
      const quantity = item.quantity;
      const totalAmount = unitPrice * quantity;
      const taxRate = product.price?.vatRate || 25;
      const totalAmountExcludingTax = Math.round(totalAmount / (1 + taxRate / 100));
      const totalTaxAmount = totalAmount - totalAmountExcludingTax;

      return {
        name: product.title || 'Produkt',
        id: product.id,
        totalAmount,
        totalAmountExcludingTax,
        totalTaxAmount,
        taxPercentage: taxRate,
        unitInfo: {
          unitPrice,
          quantity: quantity.toString(),
          quantityUnit: 'PCS',
        },
      };
    }).filter((line): line is NonNullable<typeof line> => line !== null);

    // Build ePayment request
    const paymentRequest: CreatePaymentRequest = {
      amount: {
        value: amount,
        currency,
      },
      paymentMethod: {
        type: 'WALLET', // Use Vipps/MobilePay wallet
      },
      customer: phoneNumber ? {
        phoneNumber,
      } : undefined,
      profile: {
        scope: 'name phoneNumber address email',
      },
      reference,
      returnUrl: `${publicEnv.NEXT_PUBLIC_CMS_URL}/${userLanguage}/checkout/vipps-callback?reference=${reference}`,
      userFlow: 'WEB_REDIRECT', // Standard redirect flow
      paymentDescription,
      receipt: orderLines && orderLines.length > 0 ? {
        orderLines,
        bottomLine: {
          currency,
        },
      } : undefined,
    };

    logger.info(
      {
        reference,
        amount: paymentRequest.amount,
        userFlow: paymentRequest.userFlow,
        hasCustomer: !!paymentRequest.customer,
        profileScope: paymentRequest.profile?.scope,
        orderLineCount: orderLines?.length || 0,
        orderLines: orderLines?.map(line => ({
          name: line.name,
          id: line.id,
          totalAmount: line.totalAmount,
          quantity: line.unitInfo?.quantity,
        })),
        hasReceipt: !!paymentRequest.receipt,
      },
      'Creating ePayment via API'
    );

    // Create payment using ePayment API client
    const paymentResponse = await createPayment(paymentRequest);

    // Store payment reference in cart session
    const cartUpdateResult = await setCartPaymentReference(reference);
    if (!cartUpdateResult.success) {
      logger.error(
        { error: cartUpdateResult.error, reference },
        'Failed to store payment reference in cart session',
      );
      // Don't fail the payment, but log the error
    }

    logger.info(
      {
        reference,
        pspReference: paymentResponse.pspReference,
        hasRedirectUrl: !!paymentResponse.redirectUrl,
      },
      'Vipps ePayment created successfully',
    );

    return actionSuccess(paymentResponse);
  } catch (error) {
    logger.error(
      {
        error,
        amount,
        currency,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'Error creating Vipps ePayment'
    );
    return actionError('Kunne ikke starte betaling. Prøv igjen om litt.');
  }
}
