import { OpenAPI, ProductDto } from '@losol/eventuras';
import { useEffect, useRef, useState } from 'react';

import apiResponseHandler from '@/utils/apiResponseHandler';

/*
  Something mysterious going on with the losol SDK => network call completes succesfully, but promise never resolved.
  For now lets wrap these calls ourselves.
*/

const getAPIEventProducts = ({ eventId }: { eventId: number }) =>
  fetch(`${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/events/${eventId}/products`);

const useEventProducts = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [registrationProducts, setRegistrationProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //TODO handle edge cases
  useEffect(() => {
    const execute = async () => {
      setLoading(true);
      const eventProducts = await getAPIEventProducts({
        eventId: eventRef.current,
      })
        .then(apiResponseHandler)
        .catch(err => {
          console.error(err);
          return [];
        });

      setLoading(false);
      setRegistrationProducts(eventProducts);
    };
    execute();
  }, []);
  return { loading, registrationProducts };
};

export default useEventProducts;
