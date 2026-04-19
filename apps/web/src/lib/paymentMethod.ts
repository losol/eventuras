import type { PaymentProvider } from '@/lib/eventuras-sdk';

/**
 * Display labels for PaymentProvider values. Hardcoded until translations
 * are added.
 */
export const paymentMethodLabels: { value: PaymentProvider; label: string }[] = [
  { value: 'EmailInvoice', label: 'Email invoice' },
  { value: 'PowerOfficeEmailInvoice', label: 'PowerOffice email invoice' },
  { value: 'PowerOfficeEHFInvoice', label: 'PowerOffice EHF invoice' },
  { value: 'StripeInvoice', label: 'Stripe invoice' },
  { value: 'StripeDirect', label: 'Stripe (direct)' },
  { value: 'VippsInvoice', label: 'Vipps invoice' },
  { value: 'VippsDirect', label: 'Vipps (direct)' },
];

export const getPaymentMethodLabel = (method?: PaymentProvider | null): string => {
  if (!method) return '';
  return paymentMethodLabels.find(x => x.value === method)?.label ?? method;
};
