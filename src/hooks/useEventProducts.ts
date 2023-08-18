import { ProductDto } from '@losol/eventuras';
import { useEffect, useRef, useState } from 'react';

import { getEventProducts } from '@/utils/api/functions/events';

const useEventProducts = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [registrationProducts, setRegistrationProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getEventProducts(eventRef.current.toString());
      setLoading(false);
      if (result.ok) {
        setRegistrationProducts(result.value);
        return;
      }
      setRegistrationProducts([]);
    };
    execute();
  }, []);
  return { loading, registrationProducts };
};

export default useEventProducts;
