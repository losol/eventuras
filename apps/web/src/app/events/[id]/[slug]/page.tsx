import { EventInfoStatus } from '@eventuras/sdk';
import { Container, Heading, Text } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'web:app:events', context: { page: 'EventPage' } });

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import EventDetails from '@/app/events/EventDetails';
import EventRegistrationButton from '@/app/events/EventRegistrationButton';
import { Card } from '@eventuras/ratio-ui/core/Card';
import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { appConfig } from '@/config.server';
import { formatDateSpan } from '@/utils/formatDate';

import EventNotFound from '../../EventNotFound';

type EventDetailsPageProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId = typeof organizationId === 'number'
    ? organizationId
    : parseInt(organizationId as string, 10);

  logger.info(
    { apiBaseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string, orgId },
    'Generating static params for events'
  );

  try {
    const eventuras = createSDK({ inferUrl: true });
    const eventInfos = await eventuras.events.getV3Events({
      organizationId: orgId,
    });

    if (!eventInfos?.data) return [];

    const staticParams = eventInfos.data
      .filter(event => event.id !== undefined && event.slug !== undefined)
      .map(eventInfo => ({
        id: eventInfo.id!.toString(),
        slug: eventInfo.slug!,
      }));

    logger.info({ staticParams }, 'Generated static params');
    return staticParams;
  } catch (error) {
    logger.error({ error }, 'Error generating static params');
    return [];
  }
}

export default async function EventDetailsPage({ params }: Readonly<EventDetailsPageProps>) {
  const { id, slug } = await params;

  if (isNaN(id)) {
    return <EventNotFound />;
  }

  const result = await apiWrapper(() => createSDK({ inferUrl: true }).events.getV3Events1({ id }));

  // Handle not found or draft events
  if (!result.ok || !result.value || result.value.status === EventInfoStatus.DRAFT) {
    return <EventNotFound />;
  }

  const eventinfo = result.value;

  // Redirect if slug doesn't match
  if (slug !== eventinfo.slug && eventinfo.slug) {
    redirect(`/events/${eventinfo.id}/${encodeURI(eventinfo.slug)}`);
  }

  const hasFeaturedImage = Boolean(eventinfo.featuredImageUrl);

  return (
    <Wrapper imageNavbar={hasFeaturedImage} bgDark={hasFeaturedImage} fluid>
      {eventinfo.featuredImageUrl && (
        <Card className="mx-auto min-h-[33vh]" backgroundImageUrl={eventinfo.featuredImageUrl} />
      )}
      <section className="py-16">
        <Container>
          <Heading as="h1" padding="pt-6 pb-3">
            {eventinfo.title ?? 'Mysterious Event'}
          </Heading>

          {eventinfo.headline && (
            <Heading as="h2" className="text-xl font-semibold text-gray-700" padding="py-3">
              &mdash; {eventinfo.headline}
            </Heading>
          )}

          <Text text={eventinfo.description ?? ''} className="py-3" />

          {eventinfo.dateStart && (
            <div className="py-3">
              {formatDateSpan(eventinfo.dateStart as string, eventinfo.dateEnd as string, {
                locale: appConfig.env.NEXT_PUBLIC_DEFAULT_LOCALE as string,
              })}
            </div>
          )}

          {eventinfo.city && <div className="py-2">{eventinfo.city}</div>}

          <Suspense fallback={<div>Loading registration options...</div>}>
            <EventRegistrationButton event={eventinfo} />
          </Suspense>
        </Container>
      </section>

      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails eventinfo={eventinfo} />
      </Suspense>
    </Wrapper>
  );
}
