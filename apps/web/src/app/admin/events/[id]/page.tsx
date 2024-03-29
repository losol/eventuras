import { Container } from '@eventuras/ui';
import Badge from '@eventuras/ui/Badge';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import { Logger } from '@eventuras/utils';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import Link from '@/components/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

import EventAdminActionsMenu from '../EventAdminActionsMenu';
import ParticipantsSection from './ParticipantsSection';

type EventInfoProps = {
  params: {
    id: number;
  };
};
const EventDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const eventId = params.id;

  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
  });

  const eventinfo = await apiWrapper(() =>
    eventuras.events.getV3Events1({
      id: eventId,
    })
  );

  const registrations = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations({
      eventId: eventId,
      includeUserInfo: true,
      includeProducts: true,
    })
  );

  const eventProducts = await apiWrapper(() =>
    eventuras.eventProducts.getV3EventsProducts({
      eventId: eventId,
    })
  );

  const statistics = await apiWrapper(() =>
    eventuras.eventStatistics.getV3EventsStatistics({
      eventId: eventId,
    })
  );

  if (!eventinfo.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch eventinfo ${eventId}, error: ${eventinfo.error}`
    );
  }

  if (!eventinfo.ok) {
    return <div>{t('common:event-not-found')}</div>;
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">{eventinfo.value?.title ?? ''}</Heading>
          <EventAdminActionsMenu eventinfo={eventinfo.value!} />
          <div className="flex flex-row flex-wrap">
            {eventProducts.value?.map(product => (
              <>
                <Link
                  href={`/admin/events/${eventId}/products/${product.productId}`}
                  key={product.productId}
                >
                  {product.name} <Badge>Id: {product.productId}</Badge>
                </Link>
              </>
            ))}
          </div>
        </Container>
      </Section>
      <ParticipantsSection
        eventInfo={eventinfo.value!}
        participants={registrations.value!.data!}
        statistics={statistics.value!}
        eventProducts={eventProducts.value!}
      />
    </Wrapper>
  );
};

export default EventDetailPage;
