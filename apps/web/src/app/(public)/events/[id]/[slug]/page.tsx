import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { EventInfoStatus, getV3Events, getV3EventsById } from "@/lib/eventuras-public-sdk";

const logger = Logger.create({ namespace: 'web:app:events', context: { page: 'EventPage' } });

import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Calendar, MapPin } from '@eventuras/ratio-ui/icons';

import EventDetails from '@/app/(public)/events/EventDetails';
import EventRegistrationButton from '@/app/(public)/events/EventRegistrationButton';
import { appConfig } from '@/config.server';
import { getPublicClient } from '@/lib/eventuras-public-client';

import EventNotFound from '../../EventNotFound';

type EventDetailsPageProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};

/**
 * Incremental Static Regeneration (ISR) Configuration:
 *
 * - revalidate: Pages are regenerated in the background every 5 minutes
 *   This keeps content fresh without requiring a full rebuild
 *
 * - dynamicParams: true allows new event pages to be generated on-demand
 *   When a user visits an event not in generateStaticParams, it will be
 *   generated on the first request and cached for subsequent requests
 */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId =
    typeof organizationId === 'number' ? organizationId : parseInt(organizationId as string, 10);

  logger.info(
    { apiBaseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string, orgId },
    'Generating static params for events'
  );

  try {
    // Use public client for anonymous API access during static generation
    const publicClient = getPublicClient();
    const response = await getV3Events({
      client: publicClient,
      query: {
        OrganizationId: orgId,
      },
    });

    if (!response.data?.data) return [];

    const staticParams = response.data.data
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

  // Use public client for anonymous API access
  const publicClient = getPublicClient();
  const response = await getV3EventsById({
    client: publicClient,
    path: { id },
  });

  // Handle not found or draft events
  if (!response.data || response.data.status === EventInfoStatus.DRAFT) {
    return <EventNotFound />;
  }

  const eventinfo = response.data;

  // Redirect if slug doesn't match
  if (slug !== eventinfo.slug && eventinfo.slug) {
    redirect(`/events/${eventinfo.id}/${encodeURI(eventinfo.slug)}`);
  }

  return (
    <>
      <Section className="pb-8">
        <Container>
          {eventinfo.featuredImageUrl && (
            <Card variant="wide" backgroundImageUrl={eventinfo.featuredImageUrl} />
          )}

          <Heading as="h1" padding="pt-3 pb-3">
            {eventinfo.title ?? 'Mysterious Event'}
          </Heading>

          {eventinfo.headline && (
            <Heading as="h2" className="text-xl font-semibold text-gray-700" padding="py-3">
              &mdash; {eventinfo.headline}
            </Heading>
          )}

          <Text text={eventinfo.description ?? ''} className="py-3" />

          {eventinfo.dateStart && (
            <div className="flex items-center gap-2 py-0">
              <Calendar className="h-5 w-5 mb-5 text-gray-600" />
              <span>
                {formatDateSpan(eventinfo.dateStart as string, eventinfo.dateEnd as string, {
                  locale: appConfig.env.NEXT_PUBLIC_DEFAULT_LOCALE as string,
                })}
              </span>
            </div>
          )}

          {eventinfo.city && (
            <div className="flex items-center gap-2 py-0 mb-4">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span>{eventinfo.city}</span>
            </div>
          )}

          <Suspense fallback={<div>Loading registration options...</div>}>
            <EventRegistrationButton event={eventinfo} />
          </Suspense>

        </Container>
      </Section>


      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails eventinfo={eventinfo} />
      </Suspense>
    </>
  );
}
