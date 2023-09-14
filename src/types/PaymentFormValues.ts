import { PaymentProvider } from '@losol/eventuras';

type PaymentFormValues = {
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

export default PaymentFormValues;
