/* eslint-disable @typescript-eslint/no-unused-vars */
import { PaymentFormValues } from 'components/event/register-steps/RegistrationPayment';
import { useEffect, useRef, useState } from 'react';

/*
  Something mysterious going on with the losol SDK => network call completes succesfully, but promise never resolved.
  For now lets wrap these calls ourselves.
*/

/**
 *
 * Flow
 *
 * (1)
 * API: POST v3/registrations (NewRegistrationDto => registrationId)
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

const getApiUrl = () => {};

type CreateEventRegistrationResult = {
  success: boolean;
  errorMessage: any;
};
const useCreateEventRegistration = (
  eventId: number,
  paymentDetails: PaymentFormValues,
  selectedProducts: Map<string, number>
) => {
  const eventRef = useRef(eventId);
  const [result, setResult] = useState<CreateEventRegistrationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //TODO handle edge cases
  useEffect(() => {
    const execute = async () => {};
    execute();
  }, []);
  return { loading, result };
};

export default useCreateEventRegistration;
