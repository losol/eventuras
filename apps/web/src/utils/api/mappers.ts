import {
  NewRegistrationDto,
  ProductDto,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationStatus,
  RegistrationType,
  RegistrationUpdateDto,
} from '@/lib/eventuras-sdk';
import {
  isNorway,
  isOrganizationPayer,
  normalizeOrganizationNumber,
  paymentMethodForPayer,
} from '@/lib/payer';
import { ParticipationTypes, PaymentFormValues, RegistrationProduct } from '@/types';

/**
 * Contains mappers which map Dto's from the API to whatever the view consumes.
 * Prevent feeding Dto's or API shapes directly to views
 *
 */

export const mapEventProductsToView = (eventProducts: ProductDto[]): RegistrationProduct[] => {
  if (!eventProducts?.length) return [];
  return eventProducts
    .map((product: ProductDto) => {
      let minimumQuantity = 0;
      if (product.enableQuantity) {
        minimumQuantity = product.minimumQuantity ?? 0;
      }
      return {
        id: product.productId!.toString(),
        title: product.name,
        description: product.description,
        mandatory: product.isMandatory,
        minimumQuantity,
        isBooleanSelection: !product.enableQuantity,
      } as RegistrationProduct;
    })
    .sort((a: RegistrationProduct): number => {
      //mandatory items on top
      if (a.mandatory) return -1;
      return 0;
    });
};

const blankToNull = (value: string): string | null => value.trim() || null;

/**
 * The payer as the API expects it: the participant themselves, or the organization
 * with its contact person, whose email is where the invoice goes.
 */
export const customerFromPaymentForm = (
  paymentDetails: PaymentFormValues
): RegistrationCustomerInfoDto => {
  const address = {
    address: blankToNull(paymentDetails.address),
    zip: blankToNull(paymentDetails.zip),
    city: blankToNull(paymentDetails.city),
    country: blankToNull(paymentDetails.country),
  };

  if (!isOrganizationPayer(paymentDetails.payerType)) {
    return {
      payerType: paymentDetails.payerType,
      name: paymentDetails.username,
      email: paymentDetails.email,
      ...address,
    };
  }

  const vatNumber = isNorway(paymentDetails.country)
    ? normalizeOrganizationNumber(paymentDetails.vatNumber)
    : paymentDetails.vatNumber.trim();

  return {
    payerType: paymentDetails.payerType,
    name: paymentDetails.organizationName.trim(),
    email: paymentDetails.contactEmail.trim(),
    vatNumber,
    invoiceReference: blankToNull(paymentDetails.invoiceReference),
    contactName: paymentDetails.contactName.trim(),
    ...address,
  };
};

export const mapToNewRegistration = (
  userId: string,
  eventId: number,
  paymentDetails: PaymentFormValues
) => {
  const customer = customerFromPaymentForm(paymentDetails);
  const type: RegistrationType = 'Participant';
  const newRegistration: NewRegistrationDto = {
    userId,
    eventId,
    customer,
    type,
    createOrder: true,
    paymentMethod: paymentMethodForPayer(paymentDetails.payerType),
  };

  return newRegistration;
};

export const mapToUpdatedRegistration = (
  registration: RegistrationDto,
  paymentDetails: PaymentFormValues
) => {
  const updatedRegistration: RegistrationUpdateDto = {
    customer: customerFromPaymentForm(paymentDetails),
    type: registration.type,
    paymentMethod: paymentMethodForPayer(paymentDetails.payerType),
  };
  return updatedRegistration;
};

export const mapSelectedProductsToQuantity = (
  products: ProductDto[],
  selectedProducts: any,
  isAdmin: boolean = false
): Map<string, number> => {
  const submissionMap = new Map<string, number>();

  let selProds = selectedProducts;
  if (selectedProducts.products) {
    selProds = selectedProducts.products;
  }
  Object.keys(selProds).forEach((key: any) => {
    const relatedProduct = products.find(product => product.productId?.toString() === key);
    if (!relatedProduct) return;
    const formValue = selProds[key];
    let value = 0;
    if (!relatedProduct.enableQuantity) {
      if ((relatedProduct.isMandatory && !isAdmin) || !!formValue) {
        value = 1;
      }
    } else {
      value = Number.parseInt(formValue, 10);
    }
    if (value > 0) {
      //only set when we actually have a quantity to send
      submissionMap.set(key, value);
    }
  });

  return submissionMap;
};

export const participationMap = {
  [ParticipationTypes.active]: [
    'Draft',
    'Attended',
    'Finished',
    'NotAttended',
    'Verified',
  ] as RegistrationStatus[],
  [ParticipationTypes.waitingList]: ['WaitingList'] as RegistrationStatus[],
  [ParticipationTypes.cancelled]: ['Cancelled'] as RegistrationStatus[],
};
