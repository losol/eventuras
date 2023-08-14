import { EventDto, EventsService, OpenAPI } from '@losol/eventuras';
import { EventGrid } from 'components/event';
import { Container, Layout } from 'components/layout';

import { Heading, Text } from '../components/content';
// import Events from './Events';

// Get events from eventuras
const ORGANIZATION_ID: number =
  process.env.NEXT_PUBLIC_ORGANIZATION_ID !== undefined
    ? parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID)
    : 1;
export const dynamic = 'force-dynamic';

export default async function Homepage() {
  OpenAPI.BASE = process.env.API_BASE_URL!;
  OpenAPI.VERSION = process.env.NEXT_PUBLIC_API_VERSION!;

  let eventinfos: EventDto[] = [];
  try {
    const response = await EventsService.getV3Events({
      organizationId: ORGANIZATION_ID,
    });
    eventinfos = response.data ?? [];
  } catch (error) {
    console.error('Error fetching events:', error);
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
