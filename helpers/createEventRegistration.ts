import {
  NewRegistrationDto,
  OpenAPI,
  RegistrationCustomerInfoDto,
  RegistrationDto,
  RegistrationType,
} from '@losol/eventuras';
import { PaymentFormValues } from 'components/event/register-steps/RegistrationPayment';

import apiResponseHandler from './apiResponseHandler';

/**
 *
 * Flow
 *
 * (1)
 * API: POST v3/registrations (NewRegistrationDto => RegistrationDto)
 *
 * (2)
 * API Endpoint: GET /v3/registrations/{RegistrationId}/orders
 * Retrieve order details based on the registration ID.
 * Note the orderId for later use.
 *
 * (3)
 * API Endpoint: PUT /v3/orders/{OrderId}
 * Update the order with selected optional products. (selectedProducts<productId, quantity>)
 *
 */

const registrationApiUrl = `${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/registrations`;
//const registrationOrderApiUrl = (registrationId: string) => `${registrationApiUrl}/${registrationId}/orders`; this one is not ready yet
const ordersApiUrl = `${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/orders`;
const registrationOrderApiUrl = (registrationId: number | string) =>
  `${ordersApiUrl}?RegistrationId=${registrationId}`;
const orderApiUrl = (orderId: number | string) => `${ordersApiUrl}/${orderId}`;

const createEventRegistration = async (
  userId: string,
  eventId: number,
  paymentDetails: PaymentFormValues,
  selectedProducts: Map<string, number>
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
  const registrationBody = JSON.stringify(newRegistration);
  /* (1) */
  return await fetch(registrationApiUrl, {
    method: 'POST',
    body: registrationBody,
  })
    .then(apiResponseHandler)
    .then(async (result: RegistrationDto) => {
      if (!selectedProducts.entries.length) {
        //no selected products, so we don't need to do anything else
        return { success: true };
      }
      const registrationId = result.registrationId!.toString();
      /* (2) */
      const orders = await fetch(registrationOrderApiUrl(registrationId)).then(apiResponseHandler);
      if (!orders.data.length) return { success: true };
      /* (3) */
      const firstOrderId = orderApiUrl(orders.data[0].id);
      const orderUpdateBody = JSON.stringify({
        lines: Array.from(selectedProducts, ([productId, quantity]) => ({ productId, quantity })),
      });
      await fetch(orderApiUrl(firstOrderId), {
        method: 'PUT',
        body: orderUpdateBody,
      }).then(apiResponseHandler);

      return { success: true };
    })
    .catch(err => {
      console.error(err);
      return { success: false, error: err };
    });
};

export default createEventRegistration;
