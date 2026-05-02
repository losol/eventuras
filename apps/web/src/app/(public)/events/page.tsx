import { getLocale, getTranslations } from 'next-intl/server';

import { Logger } from '@eventuras/logger';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { EventListRow } from '@/components/event';
import { getPublicClient } from '@/lib/eventuras-public-client';
import { type EventDto, getV3Events } from '@/lib/eventuras-public-sdk';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:events-page',
  context: { page: 'EventsPage' },
});

// Always render server-side so ORGANIZATION_ID is read at request time, not build time
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const ORGANIZATION_ID = getOrganizationId();
  const t = await getTranslations();
  const locale = await getLocale();
  logger.info({ organizationId: ORGANIZATION_ID }, 'Fetching events for organization');

  let events: EventDto[] = [];
  let fetchError = false;

  try {
    const publicClient = getPublicClient();
    const response = await getV3Events({
      client: publicClient,
      query: {
        OrganizationId: ORGANIZATION_ID,
        Ordering: ['DateStart', 'Title'],
      },
    });

    if (response.error) {
      logger.error(
        { error: response.error, organizationId: ORGANIZATION_ID },
        'Failed to fetch events'
      );
      fetchError = true;
    } else {
      events = response.data?.data ?? [];
      logger.info(
        { count: events.length, organizationId: ORGANIZATION_ID },
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

  return (
    <Section paddingY="lg">
      <Container>
        <Heading.Group className="mb-9">
          <Heading.Eyebrow>{t('common.events.list.eyebrow')}</Heading.Eyebrow>
          <Heading
            as="h1"
            className="font-serif font-medium text-3xl md:text-4xl leading-[1.1] tracking-tight m-0"
          >
            {t.rich('common.events.list.title', {
              em: chunks => <em className="font-serif italic text-(--primary)">{chunks}</em>,
            })}
          </Heading>
        </Heading.Group>

        {fetchError && <Text>{t('common.errors.failedToLoadEvents')}</Text>}

        {!fetchError && events.length === 0 && <Text>{t('common.events.noEventsAvailable')}</Text>}

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
      </Container>
    </Section>
  );
}
