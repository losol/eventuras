import { ProductOrderDto } from '@/lib/eventuras-sdk';

export type LocalesType = {
  component: {
    [key: string]: string;
  };
  common: {
    [key: string]: string;
  };
};

/**
 * Payment method names as used in UI forms (string keys matching the C# enum names).
 * These are converted to numeric PaymentProvider values when calling the API.
 */
export type PaymentMethodName =
  | 'EmailInvoice'
  | 'PowerOfficeEmailInvoice'
  | 'PowerOfficeEHFInvoice'
  | 'StripeInvoice'
  | 'StripeDirect'
  | 'VippsInvoice'
  | 'VippsDirect';

export type PaymentFormValues = {
  username: string;
  email: string;
  phoneNumber: string;
  city: string;
  zip: string;
  country: string;
  vatNumber: string;
  invoiceReference: string;
  paymentMethod: PaymentMethodName;
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
