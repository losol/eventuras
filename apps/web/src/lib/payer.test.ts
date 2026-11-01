import { describe, expect, it } from 'vitest';

import type { RegistrationDto, UserDto } from '@/lib/eventuras-sdk';

import {
  isNorway,
  isValidNorwegianOrganizationNumber,
  normalizeOrganizationNumber,
  paymentFormValuesFromRegistration,
  paymentMethodForPayer,
} from './payer';

const user: UserDto = { name: 'Kari Nordmann', email: 'kari@example.com' } as UserDto;

describe('isValidNorwegianOrganizationNumber', () => {
  it.each(['974760673', '974 760 673', 'NO 974 760 673 MVA', '123456785'])('accepts %s', value => {
    expect(isValidNorwegianOrganizationNumber(value)).toBe(true);
  });

  it.each(['974760674', '12345678', '1234567890', 'abc', ''])('rejects %s', value => {
    expect(isValidNorwegianOrganizationNumber(value)).toBe(false);
  });
});

describe('normalizeOrganizationNumber', () => {
  it('keeps only the digits', () => {
    expect(normalizeOrganizationNumber('NO 974 760 673 MVA')).toBe('974760673');
  });
});

describe('isNorway', () => {
  it.each(['Norway', 'norge', ' NO '])('treats %s as Norway', value => {
    expect(isNorway(value)).toBe(true);
  });

  it('treats other countries as foreign', () => {
    expect(isNorway('Sweden')).toBe(false);
  });
});

describe('paymentMethodForPayer', () => {
  it('sends EHF to organizations and email to people', () => {
    expect(paymentMethodForPayer('Private')).toBe('PowerOfficeEmailInvoice');
    expect(paymentMethodForPayer('OwnCompany')).toBe('PowerOfficeEHFInvoice');
    expect(paymentMethodForPayer('OtherOrganization')).toBe('PowerOfficeEHFInvoice');
  });
});

describe('paymentFormValuesFromRegistration', () => {
  it('restores an organization payer', () => {
    const values = paymentFormValuesFromRegistration(user, {
      payerType: 'OtherOrganization',
      customerName: 'Oslo kommune',
      customerEmail: 'per.hansen@example.com',
      customerVatNumber: '974760673',
      customerInvoiceReference: '12345',
      customerContactName: 'Per Hansen',
      customerAddress: 'Rådhusplassen 1',
      customerZip: '0037',
      customerCity: 'Oslo',
      customerCountry: 'Norway',
    } as RegistrationDto);

    expect(values).toMatchObject({
      payerType: 'OtherOrganization',
      organizationName: 'Oslo kommune',
      contactName: 'Per Hansen',
      contactEmail: 'per.hansen@example.com',
      invoiceReference: '12345',
      address: 'Rådhusplassen 1',
    });
  });

  it('treats an old business registration as own company without its name', () => {
    const values = paymentFormValuesFromRegistration(user, {
      customerName: 'Kari Nordmann',
      customerEmail: 'kari@example.com',
      customerVatNumber: '974760673',
    } as RegistrationDto);

    expect(values).toMatchObject({
      payerType: 'OwnCompany',
      organizationName: '',
      vatNumber: '974760673',
      contactName: 'Kari Nordmann',
      contactEmail: 'kari@example.com',
    });
  });

  it('treats an old registration without organization number as private', () => {
    const values = paymentFormValuesFromRegistration(user, {
      customerZip: '0150',
      customerCity: 'Oslo',
    } as RegistrationDto);

    expect(values).toMatchObject({
      payerType: 'Private',
      vatNumber: '',
      zip: '0150',
      city: 'Oslo',
      country: 'Norway',
    });
  });
});
