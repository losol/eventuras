import { Badge, Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import Link from '@/components/Link';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

import EventAdminActionsMenu from '../EventAdminActionsMenu';
import ParticipantsSection from './ParticipantsSection';

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventAdminPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;

  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const eventinfo = await apiWrapper(() =>
    eventuras.events.getV3Events1({
      id: id,
    })
  );

  const registrations = await apiWrapper(() =>
    eventuras.registrations.getV3Registrations({
      eventId: id,
      includeUserInfo: true,
      includeProducts: true,
    })
  );

  const eventProducts = await apiWrapper(() =>
    eventuras.eventProducts.getV3EventsProducts({
      eventId: id,
    })
  );

  const statistics = await apiWrapper(() =>
    eventuras.eventStatistics.getV3EventsStatistics({
      eventId: id,
    })
  );

  if (!eventinfo.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch eventinfo ${id}, error: ${eventinfo.error}`
    );
  }

  if (!eventinfo.ok) {
    return <div>{t('common.event-not-found')}</div>;
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
                  href={`/admin/events/${id}/products/${product.productId}`}
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
}
