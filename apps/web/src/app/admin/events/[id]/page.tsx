import { Badge, Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils';

import Wrapper from '@/components/eventuras/Wrapper';
import { Link } from '@eventuras/ratio-ui/next/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
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
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
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
    Logger.error({ namespace: 'EditEventinfo' }, `Event ${id} not found`);
    notFound();
  }

  if (!registrations.ok) {
    Logger.warn({ namespace: 'EventAdminPage' }, 'registrations call failed', registrations.error);
  }
  if (!eventProducts.ok) {
    Logger.warn({ namespace: 'EventAdminPage' }, 'products call failed', eventProducts.error);
  }
  if (!statistics.ok) {
    Logger.warn({ namespace: 'EventAdminPage' }, 'statistics call failed', statistics.error);
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
