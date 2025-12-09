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
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'posten-home',
    name: 'Sende med Posten',
    price: 5900, // 59 kr in øre
    brand: 'POSTEN',
    type: 'HOME_DELIVERY',
  },
  {
    id: 'pickup-valnesfjord',
    name: 'Pickup point i Valnesfjord etter avtale',
    price: 0, // gratis
    brand: 'OTHER',
    type: 'PICKUP_POINT',
  },
];
