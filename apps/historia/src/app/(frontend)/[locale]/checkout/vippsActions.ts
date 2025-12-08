'use server';

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';
import {
  createPayment,
  type CreatePaymentRequest,
  type CreatePaymentResponse,
  type ShippingBrand,
  type ShippingType,
} from '@eventuras/vipps/epayment-v1';

import { calculateCart, type CartSummary } from '@/app/(frontend)/[locale]/checkout/actions';
import { setCartPaymentReference } from '@/app/actions/cart';
import { appConfig } from '@/config.server';
import { getVippsConfig } from '@/lib/vipps/config';
import { getMeUser } from '@/utilities/getMeUser';

const logger = Logger.create({
  namespace: 'historia:payment',
  context: { module: 'vippsEPaymentActions' },
});

interface CreateVippsPaymentParams {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  userLanguage?: string;
}

/**
 * Create Vipps ePayment (WEB_REDIRECT flow)
 * Uses the new ePayment API instead of the old Checkout API
 * All price calculations are done server-side
 */
// Define available shipping options
const SHIPPING_OPTIONS = [
  {
    id: 'posten-home',
    name: 'Sende med Posten',
    price: 5900, // 59 kr in øre
    brand: 'POSTEN' as ShippingBrand,
    type: 'HOME_DELIVERY' as ShippingType,
  },
  {
    id: 'pickup-valnesfjord',
    name: 'Pickup point i Valnesfjord etter avtale',
    price: 0, // gratis
    brand: 'OTHER' as ShippingBrand,
    type: 'PICKUP_POINT' as ShippingType,
  },
];

export async function createVippsPayment({
  items,
  userLanguage = 'no',
}: CreateVippsPaymentParams): Promise<ServerActionResult<CreatePaymentResponse>> {
  try {
    logger.info({ itemCount: items.length }, 'Creating Vipps ePayment with Express Checkout');

    // Calculate cart totals server-side
    const cartResult = await calculateCart(items);
    if (!cartResult.success) {
      logger.error({ error: cartResult.error }, 'Failed to calculate cart');
      return actionError('Kunne ikke beregne handlekurv');
    }

    const cart: CartSummary = cartResult.data;

    // Try to get current user for phone number (optional)
    let phoneNumber: string | undefined;
    try {
      const userResult = await getMeUser();
      const rawPhone = userResult?.user?.phone_number;
      if (rawPhone) {
        // Normalize phone number: remove +, spaces, and other non-digits
        // Vipps requires 9-15 digits WITH country code (e.g., 4712345678)
        phoneNumber = rawPhone.replace(/\D/g, '');

        // Validate length (9-15 digits)
        if (phoneNumber.length < 9 || phoneNumber.length > 15) {
          logger.warn({ phoneNumber: rawPhone }, 'Phone number invalid length, skipping pre-fill');
          phoneNumber = undefined;
        } else {
          logger.info({ userId: userResult?.user?.id, phoneNumber }, 'Got user phone for payment');
        }
      }
    } catch (error) {
      logger.debug({ error }, 'No user session found, skipping phone pre-fill');
    }

    // Generate unique payment reference
    const reference = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    logger.info({ reference }, 'Generated new payment reference');

    // Build payment description from cart items
    const productNames = cart.items.map((item) => item.title).join(', ');
    const paymentDescription =
      cart.items.length > 0
        ? `Kjøp: ${productNames.substring(0, 100)}`
        : `Ordre ${reference}`;

    // Build order lines from calculated cart
    const orderLines = cart.items.map((item) => ({
      name: item.title,
      id: item.productId,
      totalAmount: item.lineTotalIncVat,
      totalAmountExcludingTax: item.lineTotal,
      totalTaxAmount: item.vatAmount,
      taxPercentage: item.vatRate,
      unitInfo: {
        unitPrice: item.pricePerUnit + Math.round(item.pricePerUnit * (item.vatRate / 100)),
        quantity: item.quantity.toString(),
        quantityUnit: 'PCS',
      },
    }));

    // Total amount without shipping (Vipps will add shipping cost)
    const totalAmount = cart.totalIncVat;

    // Build ePayment request
    const paymentRequest: CreatePaymentRequest = {
      amount: {
        value: totalAmount,
        currency: cart.currency,
      },
      paymentMethod: {
        type: 'WALLET', // Use Vipps/MobilePay wallet
      },
      customer: phoneNumber
        ? {
            phoneNumber,
          }
        : undefined,
      profile: {
        scope: 'name phoneNumber address email',
      },
      reference,
      returnUrl: `${appConfig.env.NEXT_PUBLIC_CMS_URL}/${userLanguage}/checkout/vipps-callback?reference=${reference}`,
      userFlow: 'WEB_REDIRECT', // Standard redirect flow
      paymentDescription,
      receipt: {
        orderLines,
        bottomLine: {
          currency: cart.currency,
        },
      },
      shipping: {
        fixedOptions: SHIPPING_OPTIONS.map((option, index) => ({
          brand: option.brand,
          type: option.type,
          isDefault: index === 0, // First option is default
          priority: index,
          options: [
            {
              id: option.id,
              amount: {
                value: option.price,
                currency: cart.currency,
              },
              name: option.name,
              isDefault: index === 0,
              priority: 0,
            },
          ],
        })),
      },
    };

    logger.info(
      {
        reference,
        amount: totalAmount,
        currency: cart.currency,
        userFlow: paymentRequest.userFlow,
        hasCustomer: !!paymentRequest.customer,
        profileScope: paymentRequest.profile?.scope,
        orderLineCount: orderLines.length,
        shippingOptionsCount: SHIPPING_OPTIONS.length,
        orderLines: orderLines.map((line) => ({
          name: line.name,
          id: line.id,
          totalAmount: line.totalAmount,
          quantity: line.unitInfo?.quantity,
        })),
      },
      'Creating ePayment with Express Checkout',
    );

    // Get Vipps configuration
    const vippsConfig = getVippsConfig();

    // Create payment using ePayment API client
    const paymentResponse = await createPayment(vippsConfig, paymentRequest);

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
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'Error creating Vipps ePayment',
    );
    return actionError('Kunne ikke starte betaling. Prøv igjen om litt.');
  }
}
