import { PaymentProvider, ProductOrderDto } from '@losol/eventuras';

export type LocalesType = {
  component: {
    [key: string]: string;
  };
  common: {
    [key: string]: string;
  };
};

export type PaymentFormValues = {
  username: string;
  email: string;
  phoneNumber: string;
  city: string;
  zip: string;
  country: string;
  vatNumber: string;
  invoiceReference: string;
  paymentMethod: PaymentProvider;
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

export type ProductSelected = Pick<ProductOrderDto, 'productId' | 'quantity'>;
