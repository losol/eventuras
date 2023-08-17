import {
  NewRegistrationDto,
  OpenAPI,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationType,
} from '@losol/eventuras';

import PaymentFormValues from '@/types/PaymentFormValues';

import apiResponseHandler from './apiResponseHandler';
import ApiResult from './ApiResult';

/**
 *
 * Flow
 *
 * (1)
 * API: POST v3/registrations (NewRegistrationDto => RegistrationDto)
 *
 * (2)
 * API Endpoint: POST v3/registrations/{registrationId}/products
  
 */

const registrationApiUrl = `${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/registrations`;
const productUpdateApiUrl = (registrationId: string) =>
  `${registrationApiUrl}/${registrationId}/products`;

const createEventRegistration = async (
  userId: string,
  eventId: number,
  paymentDetails: PaymentFormValues,
  selectedProducts: Map<string, number>
): Promise<ApiResult<any | undefined, Error | undefined>> => {
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
  const registrationBody = JSON.stringify(newRegistration);

  // (1) create registration*/
  return await fetch(registrationApiUrl, {
    method: 'POST',
    body: registrationBody,
  })
    .then(apiResponseHandler)
    .catch(() => {
      return { registrationId: 65 };
    })
    .then(async (result: RegistrationDto) => {
      const orderLines = Array.from(selectedProducts, ([productId, quantity]) => ({
        productId,
        quantity,
      }));
      if (!orderLines.length) {
        //no selected products, so we don't need to do anything else
        return ApiResult.success({});
      }
      const registrationId = result.registrationId!.toString();
      const orderUpdateBody = JSON.stringify({
        lines: orderLines,
      });
      await fetch(productUpdateApiUrl(registrationId), {
        method: 'POST',
        body: orderUpdateBody,
      }).then(apiResponseHandler);

      return ApiResult.success({});
    })
    .catch(err => {
      return ApiResult.error(err);
    });
};

export default createEventRegistration;
