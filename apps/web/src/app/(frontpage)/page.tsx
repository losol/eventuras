import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Hero } from '@eventuras/ratio-ui/blocks/Hero';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ValueTile } from '@eventuras/ratio-ui/core/ValueTile';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import {
  EventListRow,
  FeaturedCollectionSection,
  OnDemandCoursesSection,
} from '@/components/event';
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
  const locale = await getLocale();

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

  // On-demand: production uses `type === 'OnlineCourse'`; older data may
  // still use `type === 'Course' && onDemand === true`. Accept both so we
  // don't drop events through the migration.
  const isOnDemandCourse = (e: EventDto) =>
    e.type === 'OnlineCourse' || (e.type === 'Course' && e.onDemand === true);
  const onDemandCourses = events.filter(isOnDemandCourse);
  const regularEvents = events.filter(e => !isOnDemandCourse(e));

  // Build event-id → collection-name lookup so the chronological list can
  // tag each event with the collection it belongs to (when it does).
  const eventCollectionMap = new Map<number, string>();
  for (const c of featuredCollections) {
    if (!c.name) continue;
    for (const e of c.events) {
      if (typeof e.id === 'number') eventCollectionMap.set(e.id, c.name);
    }
  }

  const hasEvents = regularEvents.length > 0;
  const hasOnDemand = onDemandCourses.length > 0;
  const firstFeatured = featuredCollections[0];
  const hasFeatured = !!firstFeatured;

  return (
    <>
      <SiteNavbar title={site?.frontpage.title ?? 'Eventuras'} />

      <Hero>
        <Hero.Main>
          <Hero.Title>{site?.frontpage.title ?? 'Eventuras'}</Hero.Title>
          {site?.frontpage.introduction && <Hero.Lead>{site.frontpage.introduction}</Hero.Lead>}
          <Hero.Actions>
            {firstFeatured ? (
              <>
                <Link href="#collections" variant="button-primary">
                  {t('common.frontpage.hero.featuredCollectionCta', {
                    name: firstFeatured.name ?? '',
                  })}
                </Link>
                <Link href="#all-courses" variant="button-secondary">
                  {t('common.frontpage.hero.browseAllCta')}
                </Link>
              </>
            ) : (
              <Link href="#all-courses" variant="button-primary">
                {t('common.frontpage.hero.browseAllCta')}
              </Link>
            )}
            {hasOnDemand && (
              <Link href="#ondemand" variant="button-secondary">
                {t('common.frontpage.hero.onDemandCta')}
              </Link>
            )}
          </Hero.Actions>
        </Hero.Main>
        {events.length + featuredCollections.length > 0 && (
          <Hero.Side>
            {events.length > 0 && (
              <ValueTile
                number={events.length}
                label={t('common.frontpage.hero.coursesLabel', { count: events.length })}
              />
            )}
            {hasOnDemand && (
              <ValueTile
                number={onDemandCourses.length}
                label={t('common.frontpage.hero.onDemandLabel', {
                  count: onDemandCourses.length,
                })}
              />
            )}
            {featuredCollections.length > 1 && (
              <ValueTile
                number={featuredCollections.length}
                label={t('common.frontpage.hero.collectionsLabel', {
                  count: featuredCollections.length,
                })}
              />
            )}
          </Hero.Side>
        )}
      </Hero>

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
      {hasFeatured && (
        <div id="collections" className="scroll-mt-20">
          {featuredCollections.map(collection => (
            <FeaturedCollectionSection
              key={collection.id}
              collection={collection}
              events={collection.events}
            />
          ))}
        </div>
      )}

      {/* On-demand courses — Course events flagged onDemand */}
      {hasOnDemand && <OnDemandCoursesSection events={onDemandCourses} />}

      {/* Regular events — chronological list */}
      {hasEvents && (
        <Section paddingY="lg" id="all-courses">
          <Container>
            <Section.Header>
              <Section.Title>{t('common.events.list.shortTitle')}</Section.Title>
              <Section.Link as={Link} href="/events">
                {t('common.events.list.linkLabel')}
              </Section.Link>
            </Section.Header>
            <div className="flex flex-col gap-3.5">
              {regularEvents.map(event => (
                <EventListRow
                  key={event.id}
                  event={event}
                  ctaLabel={t('common.events.list.cta')}
                  locale={locale}
                  collectionName={
                    typeof event.id === 'number' ? eventCollectionMap.get(event.id) : undefined
                  }
                />
              ))}
            </div>
          </Container>
        </Section>
      )}
      {!hasError && !hasEvents && !hasFeatured && !hasOnDemand && (
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
