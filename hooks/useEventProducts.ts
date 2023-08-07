import { EventDto, EventProductsService, EventsService, ProductDto } from '@losol/eventuras';
import { RegistrationProduct } from 'components/event/register-steps/RegistrationCustomize';
import { useEffect, useRef, useState } from 'react';

/*
  Consideration: this one maps ProductDto to RegistrationProduct (a 'view' type) directly.
  Makes it easier to inject directly into views, but less portable.
*/
const useEventProducts = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [registrationProducts, setRegistrationProducts] = useState<RegistrationProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //TODO handle edge cases
  useEffect(() => {
    const getEventProducts = async () => {
      setLoading(true);
      const event: EventDto | null = await EventsService.getV3Events1({
        id: eventRef.current,
      });
      if (!event) return null;
      const eventProducts = await EventProductsService.getV3EventsProducts({
        eventId: event.id!,
      });
      const registrationProducts = eventProducts.map((product: ProductDto) => {
        return {
          id: product.productId,
          title: product.name,
          description: product.description,
          mandatory: false,
        } as RegistrationProduct;
      });
      setLoading(false);
      setRegistrationProducts(registrationProducts);
    };
    getEventProducts();
  }, []);

  return { loading, registrationProducts };
};

export default useEventProducts;
