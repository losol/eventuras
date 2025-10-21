import { Section, Heading, Text } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import { EventGrid } from '@/components/event';
import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

import { getV3Events } from '@eventuras/event-sdk';
import { createClient } from '@/utils/apiClient';
import List from '@eventuras/ratio-ui/core/List/List';
import Link from 'next/link';

const ORGANIZATION_ID = Number(Environment.NEXT_PUBLIC_ORGANIZATION_ID)!;

export default async function EventsPage() {
  const t = await getTranslations();

  const eventinfos = await getV3Events({
    query: {
      OrganizationId: ORGANIZATION_ID,
    },
    client: await createClient(),
  });
  return (
    <Wrapper>
      <Heading as="h1" padding="pb-4">
        {t('common.events.sectiontitle')}
      </Heading>

      {/* Events section */}
      {eventinfos.data?.count && eventinfos.data.data && (
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
