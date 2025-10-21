import {
  NewRegistrationDto,
  ProductDto,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationStatus,
  RegistrationType,
  RegistrationUpdateDto,
} from '@eventuras/sdk';

import { ParticipationTypes, PaymentFormValues, RegistrationProduct } from '@/types';

/**
 * Contains mappers which map Dto's from the API to whatever the view consumes.
 * Prevent feeding Dto's or API shapes directly to views
 *
 */

export const mapEventProductsToView = (eventProducts: ProductDto[]): RegistrationProduct[] => {
  if (!eventProducts || !eventProducts.length) return [];
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

const customerFromPaymentForm = (
  paymentDetails: PaymentFormValues
): RegistrationCustomerInfoDto => {
  return {
    vatNumber: paymentDetails.vatNumber,
    name: paymentDetails.username,
    email: paymentDetails.email,
    zip: paymentDetails.zip,
    city: paymentDetails.city,
    country: paymentDetails.country,
    invoiceReference: paymentDetails.invoiceReference,
  };
};

export const mapToNewRegistration = (
  userId: string,
  eventId: number,
  paymentDetails: PaymentFormValues
) => {
  const customer = customerFromPaymentForm(paymentDetails);
  const type: RegistrationType = RegistrationType.PARTICIPANT;
  const newRegistration: NewRegistrationDto = {
    userId,
    eventId,
    customer,
    type,
    createOrder: true,
    paymentMethod: paymentDetails.paymentMethod,
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
    paymentMethod: paymentDetails.paymentMethod,
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
      value = parseInt(formValue, 10);
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
    RegistrationStatus.DRAFT,
    RegistrationStatus.ATTENDED,
    RegistrationStatus.FINISHED,
    RegistrationStatus.NOT_ATTENDED,
    RegistrationStatus.VERIFIED,
  ],
  [ParticipationTypes.waitingList]: [RegistrationStatus.WAITING_LIST],
  [ParticipationTypes.cancelled]: [RegistrationStatus.CANCELLED],
};
