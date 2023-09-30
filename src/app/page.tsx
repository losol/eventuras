import { EventDto, EventsService, OpenAPI } from '@losol/eventuras';

import { Heading, Text } from '@/components/content';
import { EventGrid } from '@/components/event';
import { Container, Layout } from '@/components/layout';
import Environment, { EnvironmentVariables } from '@/utils/Environment';
import Logger from '@/utils/Logger';

// Get events from eventuras
const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10);

export const dynamic = 'force-dynamic';

export default async function Homepage() {
  let eventinfos: EventDto[] = [];
  try {
    //for some reason OpenAPI.BASE gets set to empty when returning to this page..
    // TODO let's rewrite these to use utils/api and be able to set the api without the forwarder
    OpenAPI.BASE = Environment.get(EnvironmentVariables.API_BASE_URL);
    OpenAPI.VERSION = Environment.NEXT_PUBLIC_API_VERSION;
    const response = await EventsService.getV3Events({
      organizationId: ORGANIZATION_ID,
    });
    eventinfos = response.data ?? [];
  } catch (error) {
    Logger.error({ namespace: 'homepage' }, 'Error fetching events:', error);
  }

  return (
    <Layout>
      <section className="bg-primary-700 dark:bg-slate-900 text-white pt-16 pb-24">
        <Container>
          <Heading as="h1">Eventuras</Heading>
          <Text>Eventuras for life</Text>
        </Container>
      </section>
      <section className="bg-primary-50 dark:bg-slate-950 pt-16 pb-24">
        <Container as="section">
          <Heading as="h2">Upcoming events</Heading>
          <EventGrid eventinfos={eventinfos} />
        </Container>
      </section>
    </Layout>
  );
}
