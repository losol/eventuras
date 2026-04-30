import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { buildCoverImageStyle } from '@eventuras/ratio-ui/utils';

import { EventGrid, FeaturedCollectionSection } from '@/components/event';
import SiteNavbar from '@/components/eventuras/SiteNavbar';
import {
  type EventCollectionDto,
  type EventDto,
  getV3Eventcollections,
  getV3Events,
  publicClient,
} from '@/lib/eventuras-public-sdk';
import { getOrganizationId } from '@/utils/organization';
import getSiteSettings from '@/utils/site/getSiteSettings';

const logger = Logger.create({ namespace: 'web:frontpage' });

// Always render server-side so ORGANIZATION_ID is read at request time, not build time
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: site?.frontpage.title ?? 'Eventuras',
    description: site?.frontpage.introduction ?? 'Event management platform',
  };
}

export default async function Homepage() {
  const site = await getSiteSettings();
  const t = await getTranslations();

  const ORGANIZATION_ID = getOrganizationId();

  let featuredCollections: (EventCollectionDto & { events: EventDto[] })[] = [];
  let events: EventDto[] = [];
  let hasError = false;

  try {
    // Fetch featured collections and their events
    const collectionsResponse = await getV3Eventcollections({
      client: publicClient,
      query: { Featured: true },
      headers: { 'Eventuras-Org-Id': ORGANIZATION_ID },
    });

    const collections = collectionsResponse.data?.data ?? [];

    // Fetch events for each featured collection (sorted by category)
    const results = await Promise.allSettled(
      collections.map(async collection => {
        const eventsResponse = await getV3Events({
          client: publicClient,
          query: {
            CollectionId: collection.id!,
            Ordering: ['Category', 'DateStart', 'Title'],
          },
        });
        return {
          ...collection,
          events: eventsResponse.data?.data ?? [],
        };
      })
    );

    featuredCollections = results
      .filter(
        (r): r is PromiseFulfilledResult<EventCollectionDto & { events: EventDto[] }> =>
          r.status === 'fulfilled'
      )
      .map(r => r.value);

    // Fetch all events (including those in featured collections)
    const eventsResponse = await getV3Events({
      client: publicClient,
      query: {
        OrganizationId: ORGANIZATION_ID,
      },
    });

    events = eventsResponse.data?.data ?? [];

    logger.info(
      {
        featuredCollections: featuredCollections.length,
        events: events.length,
      },
      'Frontpage data loaded'
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch events');
    hasError = true;
  }

  const hasEvents = events.length > 0;
  const hasFeatured = featuredCollections.length > 0;

  return (
    <>
      <SiteNavbar variant="dark" title={site?.frontpage.title ?? 'Eventuras'} />

      {/* Hero section with background image */}
      <Section
        dark
        style={buildCoverImageStyle('/assets/images/mountains.jpg')}
        className="min-h-[30vh] flex flex-col justify-end"
      >
        <Container className="pb-3">
          <Heading as="h1" paddingBottom="xs" className="text-3xl md:text-4xl lg:text-5xl">
            {site?.frontpage.introduction ?? 'Eventuras for your life!'}
          </Heading>
        </Container>
      </Section>

      {/* Error section */}
      {hasError && (
        <Section color="error" paddingY="lg">
          <Container>
            <Heading as="h2" paddingBottom="sm">
              {t('common.errors.failedToLoadEvents')}
            </Heading>
            <Text>{t('common.errors.tryRefresh')}</Text>
          </Container>
        </Section>
      )}

      {/* Featured collections — shown at the top */}
      {hasFeatured &&
        featuredCollections.map(collection => (
          <FeaturedCollectionSection
            key={collection.id}
            collection={collection}
            events={collection.events}
          />
        ))}

      {/* Regular events */}
      {hasEvents && (
        <Section paddingY="lg">
          <Container>
            <Heading as="h2" paddingBottom="sm">
              {t('common.events.sectiontitle')}
            </Heading>
            <EventGrid eventinfos={events} />
          </Container>
        </Section>
      )}
      {!hasError && !hasEvents && !hasFeatured && (
        <Section color="neutral" paddingY="lg">
          <Container>
            <Heading as="h2" paddingBottom="sm">
              {t('common.events.sectiontitle')}
            </Heading>
            <Text>{t('common.events.noEventsAvailable')}</Text>
          </Container>
        </Section>
      )}
    </>
  );
}
