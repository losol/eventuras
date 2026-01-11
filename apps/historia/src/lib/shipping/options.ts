import type { ShippingBrand, ShippingType } from '@eventuras/vipps/epayment-v1';

export interface ShippingOption {
  id: string;
  name: string;
  /** Price in minor units (øre) */
  price: number;
  brand: ShippingBrand;
  type: ShippingType;
}

/**
 * Available shipping options for checkout
 * Consider making this configurable per website/tenant
 *
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  // Posten - Home Delivery
  {
    id: 'posten-hjem',
    name: 'Levering hjem med Posten (Norge utenom Svalbard og Jan Mayen)',
    price: 5900,
    brand: 'POSTEN',
    type: 'HOME_DELIVERY',
  },
  {
    id: 'posten-svalbard',
    name: 'Levering hjem med Posten (Svalbard og Jan Mayen)',
    price: 39900,
    brand: 'POSTEN',
    type: 'HOME_DELIVERY',
  },
  // Other - Pickup Valnesfjord
  {
    id: 'pickup-valnesfjord',
    name: 'Hent i Valnesfjord etter avtale',
    price: 0,
    brand: 'OTHER',
    type: 'PICKUP_POINT',
  },
];
