import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { notFound } from 'next/navigation';

import Wrapper from '@/components/eventuras/Wrapper';
import { createClient } from '@/utils/apiClient';
import { 
  getV3EventsById, 
  getV3Registrations,
  getV3EventsByEventIdProducts,
  getV3EventsByEventIdStatistics
} from '@eventuras/event-sdk';

import EventAdminActionsMenu from '../EventAdminActionsMenu';
import ParticipantsSection from './ParticipantsSection';

const logger = Logger.create({ 
  namespace: 'web:admin:events', 
  context: { page: 'EventAdminPage' } 
});

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventAdminPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;

  const client = await createClient();

  const [eventinfoRes, registrationsRes, eventProductsRes, statisticsRes] = await Promise.all([
    getV3EventsById({ path: { id }, client }),
    getV3Registrations({ 
      query: { 
        EventId: id, 
        IncludeUserInfo: true, 
        IncludeProducts: true 
      }, 
      client 
    }),
    getV3EventsByEventIdProducts({ path: { eventId: id }, client }),
    getV3EventsByEventIdStatistics({ path: { eventId: id }, client }),
  ]);

  const eventinfo = eventinfoRes.data;
  const registrations = registrationsRes.data;
  const eventProducts = eventProductsRes.data;
  const statistics = statisticsRes.data;

  if (!eventinfo) {
    logger.error({ eventId: id, error: eventinfoRes.error }, `Event ${id} not found`);
    notFound();
  }

  if (registrationsRes.error) {
    logger.warn({ error: registrationsRes.error }, 'registrations call failed');
  }
  if (eventProductsRes.error) {
    logger.warn({ error: eventProductsRes.error }, 'products call failed');
  }
  if (statisticsRes.error) {
    logger.warn({ error: statisticsRes.error }, 'statistics call failed');
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{eventinfo.title}</Heading>
          <EventAdminActionsMenu eventinfo={eventinfo} />
        </Container>
      </Section>
      <ParticipantsSection
        eventInfo={eventinfo}
        participants={registrations?.data ?? []}
        statistics={statistics ?? {}}
        eventProducts={eventProducts ?? []}
      />
    </Wrapper>
  );
}
