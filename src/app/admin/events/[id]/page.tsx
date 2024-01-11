import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

import EventAdminActionsMenu from '../EventAdminActionsMenu';
import EventParticipantList from '../EventParticipantList';

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
    <Layout fluid>
      <Section className="bg-white pb-8">
        <Container>
          <Heading as="h1">{eventinfo.value?.title ?? ''}</Heading>
          <EventAdminActionsMenu eventinfo={eventinfo.value!} />
        </Container>
      </Section>
      <Section className="pt-8">
        <Container>
          {registrations && (
            <EventParticipantList
              participants={registrations.value?.data ?? []}
              event={eventinfo.value!}
              eventProducts={eventProducts.value ?? []}
            />
          )}
        </Container>
      </Section>
    </Layout>
  );
};

export default EventDetailPage;
