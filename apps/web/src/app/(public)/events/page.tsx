import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventListRow } from '@/components/event';
import { getPublicClient } from '@/lib/eventuras-public-client';
import { type EventDto, getV3Events } from '@/lib/eventuras-public-sdk';
import { getOrganizationId } from '@/utils/organization';
import { DEFAULT_TIME_ZONE, localDate } from '@/utils/site/occasions';

const logger = Logger.create({
  namespace: 'web:events-page',
  context: { page: 'EventsPage' },
});

// Always render server-side so ORGANIZATION_ID is read at request time, not build time
export const dynamic = 'force-dynamic';

const ARCHIVE_PAGE_SIZE = 50;

interface EventsPageProps {
  searchParams: Promise<{ archive?: string; page?: string }>;
}

// The API keeps events listed for a day after they end, so the archive starts the day before that.
function archiveEnd(): string {
  return localDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), DEFAULT_TIME_ZONE);
}

function archiveHref(page: number): string {
  return page > 1 ? `/events?archive=true&page=${page}` : '/events?archive=true';
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const ORGANIZATION_ID = getOrganizationId();
  const params = await searchParams;
  const archive = params.archive === 'true';
  const page = Math.max(1, Number.parseInt(params.page ?? '', 10) || 1);
  const t = await getTranslations();
  const locale = await getLocale();
  logger.info(
    { organizationId: ORGANIZATION_ID, archive, page },
    'Fetching events for organization'
  );

  let events: EventDto[] = [];
  let totalPages = 1;
  let fetchError = false;

  try {
    const publicClient = getPublicClient();
    const response = await getV3Events({
      client: publicClient,
      query: archive
        ? {
            OrganizationId: ORGANIZATION_ID,
            Period: 'Contain',
            End: archiveEnd(),
            Ordering: ['DateStart:desc', 'Title'],
            Page: page,
            Count: ARCHIVE_PAGE_SIZE,
          }
        : {
            OrganizationId: ORGANIZATION_ID,
            Ordering: ['DateStart', 'Title'],
          },
    });

    if (response.error) {
      logger.error(
        { error: response.error, organizationId: ORGANIZATION_ID, archive },
        'Failed to fetch events'
      );
      fetchError = true;
    } else {
      events = response.data?.data ?? [];
      totalPages = Math.max(1, response.data?.pages ?? 1);
      logger.info(
        { count: events.length, organizationId: ORGANIZATION_ID, archive, page, totalPages },
        'Successfully fetched events'
      );
    }
  } catch (error) {
    logger.warn(
      { error, organizationId: ORGANIZATION_ID, backendUrl: process.env.BACKEND_URL },
      'Exception while fetching events - this is expected during build time if backend is not running'
    );
    fetchError = true;
  }

  // A page number past the end (stale link, hand-typed) lands on the last page, not an empty one.
  if (archive && !fetchError && page > totalPages) {
    redirect(archiveHref(totalPages));
  }

  const em = (chunks: React.ReactNode) => (
    <em className="font-serif italic text-(--primary)">{chunks}</em>
  );
  const eyebrow = archive ? t('common.events.archive.eyebrow') : t('common.events.list.eyebrow');
  const title = archive
    ? t.rich('common.events.archive.title', { em })
    : t.rich('common.events.list.title', { em });
  const emptyLabel = archive
    ? t('common.events.archive.empty')
    : t('common.events.noEventsAvailable');

  return (
    <Section paddingY="lg">
      <Container>
        <div className="mb-9">
          <Heading.Group>
            <Heading.Eyebrow>{eyebrow}</Heading.Eyebrow>
            <Heading
              as="h1"
              className="font-serif font-medium text-3xl md:text-4xl leading-[1.1] tracking-tight m-0"
            >
              {title}
            </Heading>
          </Heading.Group>
          <Link
            href={archive ? '/events' : '/events?archive=true'}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary)"
          >
            {archive ? t('common.events.archive.backLabel') : t('common.events.archive.linkLabel')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {fetchError && <Text>{t('common.errors.failedToLoadEvents')}</Text>}

        {!fetchError && events.length === 0 && <Text>{emptyLabel}</Text>}

        {!fetchError && events.length > 0 && (
          <div className="flex flex-col gap-3.5">
            {events.map(event => (
              <EventListRow
                key={event.id}
                event={event}
                ctaLabel={t('common.events.list.cta')}
                locale={locale}
              />
            ))}
          </div>
        )}

        {archive && !fetchError && totalPages > 1 && (
          <nav
            aria-label={t('common.events.archive.pagination')}
            className="mt-9 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link href={archiveHref(page - 1)} variant="button-outline">
                {t('common.events.archive.previousPage')}
              </Link>
            ) : (
              <span />
            )}
            <Text>{t('common.events.archive.pageOf', { page, pages: totalPages })}</Text>
            {page < totalPages ? (
              <Link href={archiveHref(page + 1)} variant="button-outline">
                {t('common.events.archive.nextPage')}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Container>
    </Section>
  );
}
