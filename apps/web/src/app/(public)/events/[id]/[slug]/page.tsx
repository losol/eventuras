import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Logger } from '@eventuras/logger';
import { MarkdownContent } from '@eventuras/markdown';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import EventDetails from '@/app/(public)/events/EventDetails';
import EventRegistrationButton from '@/app/(public)/events/EventRegistrationButton';
import EventRegistrationCard from '@/app/(public)/events/EventRegistrationCard';
import { getPublicClient } from '@/lib/eventuras-public-client';
import { EventInfoStatus, getV3EventsById } from '@/lib/eventuras-public-sdk';

import EventNotFound from '../../EventNotFound';

const logger = Logger.create({ namespace: 'web:app:events', context: { page: 'EventPage' } });

type EventDetailsPageProps = {
  params: Promise<{
    id: number;
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: EventDetailsPageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number(rawId);

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

async function fetchEvent(id: number) {
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

    // The SDK client does not throw on HTTP errors; it returns { data, error }.
    // Treat a populated error as a real failure rather than a missing event.
    if (response.error) {
      logger.error({ error: response.error, eventId: id }, 'Failed to load event details');
      return null;
    }

    // Handle not found or draft events
    if (!response.data || response.data.status === EventInfoStatus.DRAFT) {
      logger.warn({ eventId: id, status: response.data?.status }, 'Event not found or is draft');
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error({ error, eventId: id }, 'Failed to load event details');
    return null;
  }
}

export default async function EventDetailsPage({ params }: Readonly<EventDetailsPageProps>) {
  const { id: rawId, slug } = await params;
  const id = Number(rawId);

  if (Number.isNaN(id)) {
    logger.warn({ id }, 'Invalid event ID');
    return <EventNotFound />;
  }

  const eventinfo = await fetchEvent(id);

  if (!eventinfo) {
    return <EventNotFound />;
  }

  // Redirect if slug doesn't match. redirect() signals via a thrown NEXT_REDIRECT,
  // so it must stay outside fetchEvent's try/catch or the redirect gets swallowed.
  if (slug !== eventinfo.slug && eventinfo.slug) {
    logger.info(
      { eventId: id, providedSlug: slug, correctSlug: eventinfo.slug },
      'Redirecting to correct slug'
    );
    redirect(`/events/${eventinfo.id}/${encodeURI(eventinfo.slug)}`);
  }

  const t = await getTranslations();
  const locale = await getLocale();

  const dates = eventinfo.dateStart
    ? formatDateSpan(eventinfo.dateStart as string, eventinfo.dateEnd as string, { locale })
    : '';
  const place = [eventinfo.location, eventinfo.city].filter(Boolean).join(', ');
  const deadline = eventinfo.lastRegistrationDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
        new Date(eventinfo.lastRegistrationDate as string)
      )
    : '';
  const year = eventinfo.dateStart
    ? String(new Date(eventinfo.dateStart as string).getFullYear())
    : '';
  const eyebrow = [eventinfo.category, [eventinfo.city, year].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' · ');

  const facts = [
    { label: t('common.events.detailspage.facts.date'), value: dates },
    { label: t('common.events.detailspage.facts.location'), value: place },
    { label: t('common.events.detailspage.facts.deadline'), value: deadline },
  ].filter(fact => fact.value);

  return (
    <>
      <Section paddingY="lg" className="pb-8">
        <Container size="xl">
          <Heading.Group>
            {eyebrow && <Heading.Eyebrow tone="accent">{eyebrow}</Heading.Eyebrow>}
            <Heading
              as="h1"
              className="font-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight m-0"
            >
              {eventinfo.title ?? 'Mysterious Event'}
            </Heading>
          </Heading.Group>

          {eventinfo.headline && (
            <p className="mt-4 text-xl text-(--text-muted) max-w-prose">{eventinfo.headline}</p>
          )}

          {eventinfo.description && (
            <div className="mt-4 max-w-prose">
              <MarkdownContent markdown={eventinfo.description} />
            </div>
          )}

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-(--border-1) py-6 mt-8">
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt className="font-mono text-xs uppercase tracking-widest text-(--text-subtle)">
                    {fact.label}
                  </dt>
                  <dd className="font-serif text-lg leading-tight text-(--text) mt-1">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {eventinfo.featuredImageUrl && (
            <Card
              className="h-64 rounded-xl mt-8"
              backgroundImageUrl={eventinfo.featuredImageUrl}
            />
          )}

          <div className="lg:hidden mt-6">
            <Suspense fallback={<div>Loading registration options...</div>}>
              <EventRegistrationButton event={eventinfo} />
            </Suspense>
          </div>
        </Container>
      </Section>

      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails eventinfo={eventinfo} aside={<EventRegistrationCard event={eventinfo} />} />
      </Suspense>
    </>
  );
}
