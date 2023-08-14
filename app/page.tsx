import { EventDto, EventsService, OpenAPI } from '@losol/eventuras';
import { EventGrid } from 'components/event';
import { headers } from 'next/headers';
import { Container, Layout } from 'components/layout';

import { Heading, Text } from '../components/content';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { SessionStore } from 'next-auth/core/lib/cookie';
// import Events from './Events';

// Get events from eventuras
const ORGANIZATION_ID: number =
  process.env.NEXT_PUBLIC_ORGANIZATION_ID !== undefined
    ? parseInt(process.env.NEXT_PUBLIC_ORGANIZATION_ID)
    : 1;
export const dynamic = 'force-dynamic';


export default async function Homepage() {
  /**
   *
   * These are server-side configurations, not available client-side.
   * For OpenAPI configuration on the client, check out providers.tsx
   */

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
