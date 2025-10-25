import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Logger } from '@eventuras/logger';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Calendar, MapPin } from '@eventuras/ratio-ui/icons';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import EventDetails from '@/app/(public)/events/EventDetails';
import EventRegistrationButton from '@/app/(public)/events/EventRegistrationButton';
import { appConfig } from '@/config.server';
import { getPublicClient } from '@/lib/eventuras-public-client';
import { EventInfoStatus, getV3Events, getV3EventsById } from '@/lib/eventuras-public-sdk';

import EventNotFound from '../../EventNotFound';

const logger = Logger.create({ namespace: 'web:app:events', context: { page: 'EventPage' } });

type EventDetailsPageProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: EventDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  if (Number.isNaN(id)) {
    return {
      title: 'Event Not Found',
    };
  }

  try {
    const publicClient = getPublicClient();
    const response = await getV3EventsById({
      client: publicClient,
      path: { id },
    });

    if (!response.data || response.data.status === EventInfoStatus.DRAFT) {
      return {
        title: 'Event Not Found',
      };
    }

    const event = response.data;
    return {
      title: event.title ?? 'Event',
      description: event.headline ?? event.description ?? 'Event details',
      openGraph: event.featuredImageUrl
        ? {
            images: [event.featuredImageUrl],
          }
        : undefined,
    };
  } catch (error) {
    logger.error({ error, eventId: id }, 'Failed to generate metadata');
    return {
      title: 'Event',
    };
  }
}

export async function generateStaticParams() {
  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const orgId =
    typeof organizationId === 'number'
      ? organizationId
      : Number.parseInt(organizationId as string, 10);

  logger.info(
    { apiBaseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string, orgId },
    'Generating static params for events'
  );

  try {
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

  if (Number.isNaN(id)) {
    logger.warn({ id }, 'Invalid event ID');
    return <EventNotFound />;
  }

  try {
    // Use public client for anonymous API access
    const publicClient = getPublicClient();
    const response = await getV3EventsById({
      client: publicClient,
      path: { id },
    });

    logger.info(
      {
        eventId: id,
        hasData: !!response.data,
        hasError: !!response.error,
        status: response.data?.status,
      },
      'Event details fetched'
    );

    // Handle not found or draft events
    if (!response.data || response.data.status === EventInfoStatus.DRAFT) {
      logger.warn({ eventId: id, status: response.data?.status }, 'Event not found or is draft');
      return <EventNotFound />;
    }

    const eventinfo = response.data;

    // Redirect if slug doesn't match
    if (slug !== eventinfo.slug && eventinfo.slug) {
      logger.info(
        { eventId: id, providedSlug: slug, correctSlug: eventinfo.slug },
        'Redirecting to correct slug'
      );
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
  } catch (error) {
    logger.error({ error, eventId: id }, 'Failed to load event details');
    return <EventNotFound />;
  }
}
