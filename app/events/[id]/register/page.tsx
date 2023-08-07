import { UsersService } from '@losol/eventuras';
import { EventDto, EventProductsService, EventsService, ProductDto } from '@losol/eventuras';
import { RegistrationProduct } from 'components/event/register-steps/RegistrationCustomize';

import EventRegistrationPage from '../(components)/EventRegistrationPage';

type EventRegistrationProps = {
  params: {
    id: number;
  };
};

async function getUserAndEventProducts(id: number) {
  const event: EventDto | null = await EventsService.getV3Events1({ id });
  if (!event) return { userProfile: null, eventProducts: null };

  const [userProfile, eventProducts] = await Promise.all([
    UsersService.getV3UsersMe(),
    EventProductsService.getV3EventsProducts({ eventId: id }),
  ]);
  return { userProfile, eventProducts };
}

export default async function EventRegistration({ params }: EventRegistrationProps) {
  const { userProfile, eventProducts } = await getUserAndEventProducts(params.id);

  if (!userProfile || !eventProducts) return 'LOADING';

  const registrationProducts = eventProducts.map((product: ProductDto) => {
    return {
      id: product.productId,
      title: product.name,
      description: product.description,
      mandatory: false,
    } as RegistrationProduct;
  });

  return (
    <EventRegistrationPage
      eventId={params.id}
      products={registrationProducts}
      userProfile={userProfile}
    />
  );
}
