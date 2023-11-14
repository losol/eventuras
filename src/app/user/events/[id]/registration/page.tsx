import { EventDto, ProductDto, RegistrationDtoPageResponseDto, UserDto } from '@losol/eventuras';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import Text from '@/components/ui/Text';
import createSDK from '@/utils/createSDK';
import Logger from '@/utils/Logger';

import EventRegistrationProcess from './EventRegistrationProcess';

type UserEventRegistrationPageProps = {
  params: {
    id: number;
  };
};

const UserEventRegistrationPage: React.FC<UserEventRegistrationPageProps> = async ({ params }) => {
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const { t } = createTranslation();

  const user: UserDto = await eventuras.users.getV3UsersMe({});
  if (!user) {
    return <div>{t('common:errormessages.user-not-found')}</div>;
  }

  const event: EventDto = await eventuras.events.getV3Events1({
    id: params.id,
  });
  if (!event) {
    return <div>{t('common:errormessages.event-not-found')}</div>;
  }

  const userEventRegistrations: RegistrationDtoPageResponseDto =
    await eventuras.registrations.getV3Registrations({
      userId: user.id!,
      eventId: params.id,
    });

  if (userEventRegistrations && userEventRegistrations.total! > 0) {
    return (
      <Layout>
        <Heading>{t('user:registrations.page.already-registered.title')}</Heading>
        <Text spacingClassName="py-8" data-test-id="already-registered-text">
          {t('user:registration.page.texts.user-already-registered')}
        </Text>

        <Link href="/user" variant="button-primary">
          {t('common:buttons.userprofile')}
        </Link>
      </Layout>
    );
  }

  const products: ProductDto[] = await eventuras.eventProducts.getV3EventsProducts({
    eventId: params.id,
  });

  Logger.debug({ namespace: 'user-event-registration' }, { user, event, products });

  return (
    <Layout>
      <h1>{t('user:events.registration.title')}</h1>
      <p>
        {t('user:events.registration.customizationfor')} {event.title}!
      </p>
      <EventRegistrationProcess user={user} eventInfo={event} products={products} />
    </Layout>
  );
};

export default UserEventRegistrationPage;
