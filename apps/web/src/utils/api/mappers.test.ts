import { describe, expect, it } from 'vitest';

import type { PaymentFormValues } from '@/types';

import { customerFromPaymentForm, mapToNewRegistration } from './mappers';

const base: PaymentFormValues = {
  username: 'Kari Nordmann',
  email: 'kari@example.com',
  phoneNumber: '+4791234567',
  payerType: 'Private',
  organizationName: '',
  vatNumber: '',
  invoiceReference: '',
  contactName: '',
  contactEmail: '',
  address: 'Storgata 1',
  zip: '0155',
  city: 'Oslo',
  country: 'Norway',
};

const organization: PaymentFormValues = {
  ...base,
  payerType: 'OtherOrganization',
  organizationName: 'Oslo kommune',
  vatNumber: 'NO 974 760 673 MVA',
  invoiceReference: '12345',
  contactName: 'Per Hansen',
  contactEmail: 'per.hansen@example.com',
};

describe('customerFromPaymentForm', () => {
  it('bills a private payer in their own name, without organization details', () => {
    expect(customerFromPaymentForm({ ...base, vatNumber: '974760673' })).toEqual({
      payerType: 'Private',
      name: 'Kari Nordmann',
      email: 'kari@example.com',
      address: 'Storgata 1',
      zip: '0155',
      city: 'Oslo',
      country: 'Norway',
    });
  });

  it('bills an organization through its contact person', () => {
    expect(customerFromPaymentForm(organization)).toMatchObject({
      payerType: 'OtherOrganization',
      name: 'Oslo kommune',
      email: 'per.hansen@example.com',
      vatNumber: '974760673',
      invoiceReference: '12345',
      contactName: 'Per Hansen',
    });
  });

  it('keeps a foreign organization number as typed', () => {
    const customer = customerFromPaymentForm({
      ...organization,
      country: 'Sweden',
      vatNumber: 'SE556000016701',
    });
    expect(customer.vatNumber).toBe('SE556000016701');
  });
});

describe('mapToNewRegistration', () => {
  it('derives the payment method from the payer', () => {
    expect(mapToNewRegistration('u1', 1, base).paymentMethod).toBe('PowerOfficeEmailInvoice');
    expect(mapToNewRegistration('u1', 1, organization).paymentMethod).toBe('PowerOfficeEHFInvoice');
  });
});
