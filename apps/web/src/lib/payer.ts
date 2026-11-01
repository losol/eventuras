import type {
  PaymentProvider,
  RegistrationDto,
  RegistrationPayerType,
  UserDto,
} from '@/lib/eventuras-sdk';
import type { PaymentFormValues } from '@/types';

/** True when an organization, not the participant, pays the invoice. */
export const isOrganizationPayer = (payerType: RegistrationPayerType): boolean =>
  payerType === 'OwnCompany' || payerType === 'OtherOrganization';

/**
 * Organizations get an electronic invoice (EHF), people an invoice by email.
 * PowerOffice falls back to email for an organization that cannot receive EHF.
 */
export const paymentMethodForPayer = (payerType: RegistrationPayerType): PaymentProvider =>
  isOrganizationPayer(payerType) ? 'PowerOfficeEHFInvoice' : 'PowerOfficeEmailInvoice';

const norwayNames = new Set(['norway', 'norge', 'noreg', 'no']);

export const isNorway = (country: string | null | undefined): boolean =>
  norwayNames.has((country ?? '').trim().toLowerCase());

/** Keeps only the digits, so "NO 974 760 673 MVA" becomes "974760673". */
export const normalizeOrganizationNumber = (value: string): string => value.replace(/\D/g, '');

/**
 * Checks a Norwegian organization number: nine digits whose last digit is the
 * modulus 11 control digit of the first eight. Accepts spaces and the "NO"/"MVA" affixes.
 */
export const isValidNorwegianOrganizationNumber = (value: string): boolean => {
  const digits = normalizeOrganizationNumber(value);
  if (!/^\d{9}$/.test(digits)) {
    return false;
  }

  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((total, weight, i) => total + weight * Number(digits[i]), 0);
  const control = (11 - (sum % 11)) % 11;

  return control !== 10 && control === Number(digits[8]);
};

export const getInitialPaymentFormValues = (user: UserDto): PaymentFormValues => ({
  username: user.name ?? '',
  email: user.email ?? '',
  phoneNumber: user.phoneNumber ?? '',
  payerType: 'Private',
  organizationName: '',
  vatNumber: '',
  invoiceReference: '',
  contactName: '',
  contactEmail: '',
  address: '',
  zip: '',
  city: '',
  country: 'Norway',
});

/**
 * Prefills the payer step from an existing registration. Registrations made before the
 * payer step have no payer type: an organization number means the old "business" choice,
 * and their customer name is the participant, not the organization.
 */
export const paymentFormValuesFromRegistration = (
  user: UserDto,
  registration: RegistrationDto
): PaymentFormValues => {
  const initial = getInitialPaymentFormValues(user);
  const isLegacy = !registration.payerType;
  const payerType: RegistrationPayerType =
    registration.payerType ?? (registration.customerVatNumber ? 'OwnCompany' : 'Private');
  const isOrganization = isOrganizationPayer(payerType);

  return {
    ...initial,
    payerType,
    organizationName: isOrganization && !isLegacy ? (registration.customerName ?? '') : '',
    vatNumber: isOrganization ? (registration.customerVatNumber ?? '') : '',
    invoiceReference: isOrganization ? (registration.customerInvoiceReference ?? '') : '',
    contactName: isOrganization ? (registration.customerContactName ?? initial.username) : '',
    contactEmail: isOrganization
      ? ((isLegacy ? null : registration.customerEmail) ?? initial.email)
      : '',
    address: registration.customerAddress ?? '',
    zip: registration.customerZip ?? '',
    city: registration.customerCity ?? '',
    country: registration.customerCountry || initial.country,
  };
};
