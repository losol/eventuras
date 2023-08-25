import { EventDto, EventsService } from '@losol/eventuras';

import { Heading, Text } from '@/components/content';
import { EventGrid } from '@/components/event';
import { Container, Layout } from '@/components/layout';
import Logger from '@/utils/Logger';

// Get events from eventuras
const ORGANIZATION_ID: number =
  process.env.NEXT_PUBLIC_ORGANIZATION_ID !== undefined
    ? parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID)
    : 1;
export const dynamic = 'force-dynamic';

export default async function Homepage() {
  let eventinfos: EventDto[] = [];
  try {
    const response = await EventsService.getV3Events({
      organizationId: ORGANIZATION_ID,
    });
    eventinfos = response.data ?? [];
  } catch (error) {
    Logger.error({ namespace: 'homepage' }, 'Error fetching events:', error);
  }

  return (
    <Layout>
      <Heading as="h1">Eventuras</Heading>
      <Text>Eventuras for life</Text>
      <Container as="section">
        <Heading as="h2">Upcoming</Heading>
        <EventGrid eventinfos={eventinfos} />
      </Container>
    </Layout>
  );
}
