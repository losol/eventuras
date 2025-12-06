import { NextRequest, NextResponse } from 'next/server';

import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'historia:vipps',
  context: { module: 'shippingCallback' },
});

interface VippsShippingCallbackRequest {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  amount: {
    value: number; // in øre
    currency: string;
  };
}

/**
 * Calculate lead time (estimated delivery dates)
 * @param isExpress - Whether this is express shipping
 * @returns Object with earliest and latest delivery dates in ISO format
 */
function calculateLeadTime(isExpress: boolean) {
  const today = new Date();

  if (isExpress) {
    // Express: 1-2 business days
    const earliest = new Date(today);
    earliest.setDate(earliest.getDate() + 1);

    const latest = new Date(today);
    latest.setDate(latest.getDate() + 2);

    return {
      earliest: earliest.toISOString().split('T')[0],
      latest: latest.toISOString().split('T')[0],
    };
  } else {
    // Standard: 3-5 business days
    const earliest = new Date(today);
    earliest.setDate(earliest.getDate() + 3);

    const latest = new Date(today);
    latest.setDate(latest.getDate() + 5);

    return {
      earliest: earliest.toISOString().split('T')[0],
      latest: latest.toISOString().split('T')[0],
    };
  }
}

/**
 * Vipps Checkout dynamic shipping callback
 * Called when user enters/updates their address during checkout
 * Must respond within 8 seconds or Vipps falls back to fixedOptions
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VippsShippingCallbackRequest;

    logger.info(
      {
        postalCode: body.postalCode,
        city: body.city,
        country: body.country,
        orderAmount: body.amount.value,
      },
      'Received shipping callback from Vipps',
    );

    // Validate country (only support Norway for now)
    if (body.country && body.country !== 'NO') {
      logger.warn({ country: body.country }, 'Unsupported country for shipping');
      return NextResponse.json([], { status: 200 }); // Empty array = no shipping available
    }

    // Calculate shipping costs based on order amount
    const orderAmount = body.amount.value; // in øre
    const freeShippingThreshold = 50000; // 500 NOK in øre

    // Determine if shipping should be free
    const isFreeShipping = orderAmount >= freeShippingThreshold;

    // Standard shipping cost
    const standardCost = isFreeShipping ? 0 : 9900; // 99 NOK or free
    const standardLeadTime = calculateLeadTime(false);

    // Express shipping cost (never free)
    const expressCost = 19900; // 199 NOK
    const expressLeadTime = calculateLeadTime(true);

    // Return shipping options
    const shippingOptions = [
      // Home delivery options
      {
        brand: 'BRING', // Using BRING (Posten Norge)
        type: 'HOME_DELIVERY',
        options: [
          {
            id: 'standard',
            amount: {
              currency: 'NOK',
              value: standardCost,
            },
            name: isFreeShipping ? 'Gratis frakt - Standard levering' : 'Standard levering',
            description: '3-5 virkedager',
            delivery: {
              leadTime: standardLeadTime,
            },
          },
          {
            id: 'express',
            amount: {
              currency: 'NOK',
              value: expressCost,
            },
            name: 'Ekspress levering',
            description: '1-2 virkedager',
            delivery: {
              leadTime: expressLeadTime,
            },
          },
        ],
      },
      // Pickup options
      {
        brand: 'OTHER',
        type: 'PICKUP_POINT',
        options: [
          {
            id: 'pickup-popup',
            amount: {
              currency: 'NOK',
              value: 0, // Free pickup
            },
            name: 'Hent i Popup butikk',
            description: 'Gratis henting',
            delivery: {
              pickupPoints: [
                {
                  id: 'popup-store',
                  name: 'Popup butikk',
                  address: {
                    addressLine1: 'Se åpningstider på nettsiden',
                    city: 'Se nettsiden',
                    postalCode: '',
                    country: 'NO',
                  },
                  openingHours: 'Se åpningstider på nettsiden',
                },
              ],
            },
          },
          {
            id: 'pickup-valnesfjord',
            amount: {
              currency: 'NOK',
              value: 0, // Free pickup
            },
            name: 'Hent etter avtale i Valnesfjord',
            description: 'Gratis henting etter avtale',
            delivery: {
              pickupPoints: [
                {
                  id: 'valnesfjord',
                  name: 'Valnesfjord',
                  address: {
                    addressLine1: 'Etter avtale',
                    city: 'Valnesfjord',
                    postalCode: '8215',
                    country: 'NO',
                  },
                  openingHours: 'Etter avtale - kontakt oss for å avtale tid',
                },
              ],
            },
          },
        ],
      },
    ];

    logger.info(
      {
        optionsCount: shippingOptions[0].options.length,
        isFreeShipping,
        orderAmount,
      },
      'Returning shipping options',
    );

    return NextResponse.json(shippingOptions, { status: 200 });
  } catch (error) {
    logger.error({ error }, 'Error processing shipping callback');

    // Return empty array on error - Vipps will use fallback options
    return NextResponse.json([], { status: 200 });
  }
}
