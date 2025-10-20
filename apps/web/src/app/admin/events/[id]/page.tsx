import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Logger } from '@eventuras/logger';
import { notFound } from 'next/navigation';

import {
  getV3EventsById,
  getV3Registrations,
  getV3EventsByEventIdProducts,
  getV3EventsByEventIdStatistics
} from '@eventuras/event-sdk';

import EventAdminActionsMenu from '../EventAdminActionsMenu';
import ParticipantsSection from './ParticipantsSection';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { page: 'EventAdminPage' }
});

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EventAdminPage({ params }: Readonly<EventInfoProps>) {
  const { id } = await params;

  const [eventinfoRes, registrationsRes, eventProductsRes, statisticsRes] = await Promise.all([
    getV3EventsById({ path: { id } }),
    getV3Registrations({
      query: {
        EventId: id,
        IncludeUserInfo: true,
        IncludeProducts: true
      }
    }),
    getV3EventsByEventIdProducts({ path: { eventId: id } }),
    getV3EventsByEventIdStatistics({ path: { eventId: id } }),
  ]);

  const eventinfo = eventinfoRes?.data;

  if (!eventinfo) {
    logger.error({ eventId: id, error: eventinfoRes?.error }, `Event ${id} not found`);
    notFound();
  }

  if (registrationsRes?.error) {
    logger.warn({
      eventId: id,
      error: registrationsRes.error,
    }, 'Failed to load registrations');
  }
  if (eventProductsRes?.error) {
    logger.warn({
      eventId: id,
      error: eventProductsRes.error,
    }, 'Failed to load event products');
  }
  if (statisticsRes?.error) {
    logger.warn({
      eventId: id,
      error: statisticsRes.error,
    }, 'Failed to load statistics');
  }

  // Check if we have any errors OR if responses are null (simulated error state)
  const hasPartialErrors = !!(
    registrationsRes?.error ||
    eventProductsRes?.error ||
    statisticsRes?.error ||
    !registrationsRes ||
    !eventProductsRes ||
    !statisticsRes
  );

  return (
    <>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">{eventinfo.title}</Heading>
          <EventAdminActionsMenu eventinfo={eventinfo} />

          {hasPartialErrors && (
            <div className="mt-4">
              <Error type="generic" tone="warning">
                <Error.Title>Some Data Could Not Be Loaded</Error.Title>
                <Error.Description>
                  The event information loaded successfully, but some additional data is temporarily unavailable:
                </Error.Description>
                <Error.Details>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {(!registrationsRes || !!registrationsRes?.error) && <li>Participant registrations</li>}
                    {(!eventProductsRes || !!eventProductsRes?.error) && <li>Event products</li>}
                    {(!statisticsRes || !!statisticsRes?.error) && <li>Event statistics</li>}
                  </ul>
                </Error.Details>
              </Error>
            </div>
          )}
        </Container>
      </Section>
      <ParticipantsSection
        eventInfo={eventinfo}
        participants={registrationsRes.data?.data ?? []}
        statistics={statisticsRes.data ?? {}}
        eventProducts={eventProductsRes.data ?? []}
      />
    </>
  );
}
