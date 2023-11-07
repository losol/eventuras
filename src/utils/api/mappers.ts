import {
  NewRegistrationDto,
  ProductDto,
  RegistrationCustomerInfoDto,
  RegistrationType,
} from '@losol/eventuras';

import PaymentFormValues from '@/types/PaymentFormValues';
import { RegistrationProduct } from '@/types/RegistrationProduct';

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

export const mapToNewRegistration = (
  userId: string,
  eventId: number,
  paymentDetails: PaymentFormValues
) => {
  const customer: RegistrationCustomerInfoDto = {
    vatNumber: paymentDetails.vatNumber,
    name: paymentDetails.username,
    email: paymentDetails.email,
    zip: paymentDetails.zip,
    city: paymentDetails.city,
    country: paymentDetails.country,
    invoiceReference: paymentDetails.invoiceReference,
  };
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

export const mapSelectedProductsToQuantity = (
  products: ProductDto[],
  selectedProducts: Array<any>
): Map<string, number> => {
  const submissionMap = new Map<string, number>();
  Object.keys(selectedProducts).forEach((key: any) => {
    const relatedProduct = products.find(product => product.productId === key);
    if (!relatedProduct) return;
    const formValue = selectedProducts[key];
    let value = 0;
    if (!relatedProduct.enableQuantity) {
      if (relatedProduct.isMandatory || !!formValue) {
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
