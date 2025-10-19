import { Heading, Text } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import { Logger } from '@eventuras/logger';

import Wrapper from '@/components/eventuras/Wrapper';
import { publicEnv } from '@/config.client';

import { getV3Events } from '@eventuras/event-sdk';
import {List} from '@eventuras/ratio-ui/core/List';
import Link from 'next/link';

const logger = Logger.create({ 
  namespace: 'web:events-page',
  context: { page: 'EventsPage' }
});

const ORGANIZATION_ID = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;

export default async function EventsPage() {
  const t = await getTranslations();

  logger.info({ organizationId: ORGANIZATION_ID }, 'Fetching events for organization');

  let eventinfos;
  let fetchError = false;

  try {
    eventinfos = await getV3Events({
      query: {
        OrganizationId: ORGANIZATION_ID
      }
    });

    if (eventinfos.error) {
      logger.error({ 
        error: eventinfos.error,
        organizationId: ORGANIZATION_ID 
      }, 'Failed to fetch events');
      fetchError = true;
    } else {
      logger.info({ 
        count: eventinfos.data?.count || 0,
        organizationId: ORGANIZATION_ID 
      }, 'Successfully fetched events');
    }
  } catch (error) {
    logger.warn({ 
      error,
      organizationId: ORGANIZATION_ID,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL 
    }, 'Exception while fetching events - this is expected during build time if backend is not running');
    fetchError = true;
  }

  return (
    <Wrapper>
      <Heading as="h1" padding="pb-4">
        {t('common.events.sectiontitle')}
      </Heading>

      {/* Show error message if fetch failed */}
      {fetchError && (
        <Text>
          Unable to load events. Please try again later.
        </Text>
      )}

      {/* Events section */}
      {!fetchError && eventinfos?.data?.count && eventinfos.data.data && (
        <List>
          {eventinfos.data.data.map(eventInfo => (
            <List.Item key={eventInfo.id}>
              <Link href={`/events/${eventInfo.id}`}>
                <Text>{eventInfo.title}</Text>
              </Link>
            </List.Item>
          ))}
        </List>
      )}
    </Wrapper>
  );
}
