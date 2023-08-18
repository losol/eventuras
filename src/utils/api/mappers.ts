import { NewRegistrationDto } from '@losol/eventuras/models/NewRegistrationDto';
import { ProductDto } from '@losol/eventuras/models/ProductDto';
import { RegistrationCustomerInfoDto } from '@losol/eventuras/models/RegistrationCustomerInfoDto';
import { RegistrationType } from '@losol/eventuras/models/RegistrationType';

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
    notes: 'note taking needs to be implemented',
  };

  return newRegistration;
};
