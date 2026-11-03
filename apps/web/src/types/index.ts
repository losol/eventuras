import { ProductOrderDto, RegistrationPayerType } from '@/lib/eventuras-sdk';

export type LocalesType = {
  component: {
    [key: string]: string;
  };
  common: {
    [key: string]: string;
  };
};

/**
 * The payer step. `username`, `email` and `phoneNumber` are the participant. When an
 * organization pays, `organizationName`, `vatNumber`, `contactName` and `contactEmail`
 * describe it; the address is the payer's either way. The payment method follows from
 * `payerType` (see `paymentMethodForPayer`).
 */
export type PaymentFormValues = {
  username: string;
  email: string;
  phoneNumber: string;
  payerType: RegistrationPayerType;
  organizationName: string;
  vatNumber: string;
  invoiceReference: string;
  contactName: string;
  contactEmail: string;
  address: string;
  zip: string;
  city: string;
  country: string;
};

export type RegistrationProduct = {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  minimumQuantity: number;
  isBooleanSelection: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
};

export enum ParticipationTypes {
  active = 'active',
  waitingList = 'waitingList',
  cancelled = 'cancelled',
}
export type ParticipationTypesKey = keyof typeof ParticipationTypes;

export type ProductSelected = Pick<ProductOrderDto, 'productId' | 'quantity'>;
