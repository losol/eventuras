import { Badge, Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'web:admin:events', context: { page: 'EventAdminPage' } });

import Wrapper from '@/components/eventuras/Wrapper';
import { Link } from '@eventuras/ratio-ui-next/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

import EventAdminActionsMenu from '../EventAdminActionsMenu';
import ParticipantsSection from './ParticipantsSection';
import { notFound } from 'next/navigation';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventAdminPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;

  const eventuras = createSDK({
    baseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string,
    authHeader: await getAccessToken(),
  });

  const [eventinfo, registrations, eventProducts, statistics] = await Promise.all([
    apiWrapper(() => eventuras.events.getV3Events1({ id })),
    apiWrapper(() =>
      eventuras.registrations.getV3Registrations({
        eventId: id,
        includeUserInfo: true,
        includeProducts: true,
      })
    ),
    apiWrapper(() => eventuras.eventProducts.getV3EventsProducts({ eventId: id })),
    apiWrapper(() => eventuras.eventStatistics.getV3EventsStatistics({ eventId: id })),
  ]);

  if (!eventinfo.ok || !eventinfo.value) {
    logger.error(`Event ${id} not found`);
    notFound();
  }

  if (!registrations.ok) {
    logger.warn({ error: registrations.error }, 'registrations call failed');
  }
  if (!eventProducts.ok) {
    logger.warn({ error: eventProducts.error }, 'products call failed');
  }
  if (!statistics.ok) {
    logger.warn({ error: statistics.error }, 'statistics call failed');
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{eventinfo.value!.title}</Heading>
          <EventAdminActionsMenu eventinfo={eventinfo.value!} />
        </Container>
      </Section>
      <ParticipantsSection
        eventInfo={eventinfo.value!}
        participants={registrations.value?.data ?? []}
        statistics={statistics.value ?? {}}
        eventProducts={eventProducts.value ?? []}
      />
    </Wrapper>
  );
}
