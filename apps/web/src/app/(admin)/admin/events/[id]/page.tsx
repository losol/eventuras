import { notFound } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { Error } from '@eventuras/ratio-ui/blocks/Error';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { appConfig } from '@/config.server';
import {
  getV3EventsByEventIdProducts,
  getV3EventsByEventIdStatistics,
  getV3EventsById,
  getV3Notifications,
  getV3Registrations,
  NotificationDto,
} from '@/lib/eventuras-sdk';

import EventPageTabs from './EventPageTabs';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { page: 'EventAdminPage' },
});

type EventInfoProps = {
  params: Promise<{
    id: number;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type NotificationListResponse = {
  total: number;
  data: NotificationDto[];
};

export default async function EventAdminPage({ params, searchParams }: Readonly<EventInfoProps>) {
  const { id } = await params;
  const search = await searchParams;

  // Determine default tab based on query params
  const isNewlyCreated = search.newlyCreated === 'true';
  const defaultTab = isNewlyCreated ? 'overview' : 'participants';

  const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
  if (!organizationId || typeof organizationId !== 'number') {
    logger.error('NEXT_PUBLIC_ORGANIZATION_ID is not configured properly');
  }

  const [eventinfoRes, registrationsRes, eventProductsRes, statisticsRes, notificationsRes] =
    await Promise.all([
      getV3EventsById({ path: { id } }),
      getV3Registrations({
        query: {
          EventId: id,
          IncludeUserInfo: true,
          IncludeProducts: true,
          IncludeOrders: true,
        },
      }),
      getV3EventsByEventIdProducts({ path: { eventId: id } }),
      getV3EventsByEventIdStatistics({ path: { eventId: id } }),
      organizationId && typeof organizationId === 'number'
        ? getV3Notifications({
            headers: {
              'Eventuras-Org-Id': organizationId,
            },
            query: {
              EventId: id,
            },
          })
        : Promise.resolve({ data: undefined, error: 'Organization ID not configured' }),
    ]);
  const eventinfo = eventinfoRes?.data;
  if (!eventinfo) {
    logger.error({ eventId: id, error: eventinfoRes?.error }, `Event ${id} not found`);
    notFound();
  }
  if (registrationsRes?.error) {
    logger.warn(
      {
        eventId: id,
        error: registrationsRes.error,
      },
      'Failed to load registrations'
    );
  }
  if (eventProductsRes?.error) {
    logger.warn(
      {
        eventId: id,
        error: eventProductsRes.error,
      },
      'Failed to load event products'
    );
  }
  if (statisticsRes?.error) {
    logger.warn(
      {
        eventId: id,
        error: statisticsRes.error,
      },
      'Failed to load statistics'
    );
  }
  if (notificationsRes?.error) {
    logger.warn(
      {
        eventId: id,
        error: notificationsRes.error,
      },
      'Failed to load notifications'
    );
  }

  // Extract notifications data
  const notificationData = notificationsRes?.data as NotificationListResponse | undefined;
  const notifications = notificationData?.data || [];

  // Check if we have any errors OR if responses are null (simulated error state)
  const hasPartialErrors = !!(
    registrationsRes?.error ||
    eventProductsRes?.error ||
    statisticsRes?.error ||
    notificationsRes?.error ||
    !registrationsRes ||
    !eventProductsRes ||
    !statisticsRes
  );
  return (
    <>
      <Section>
        <Container>
          <Heading as="h1">{eventinfo.title}</Heading>
          {hasPartialErrors && (
            <div className="mt-4">
              <Error type="generic" tone="warning">
                <Error.Title>Some Data Could Not Be Loaded</Error.Title>
                <Error.Description>
                  The event information loaded successfully, but some additional data is temporarily
                  unavailable:
                </Error.Description>
                <Error.Details>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {(!registrationsRes || !!registrationsRes?.error) && (
                      <li>Participant registrations</li>
                    )}
                    {(!eventProductsRes || !!eventProductsRes?.error) && <li>Event products</li>}
                    {(!statisticsRes || !!statisticsRes?.error) && <li>Event statistics</li>}
                    {!!notificationsRes?.error && <li>Notifications</li>}
                  </ul>
                </Error.Details>
              </Error>
            </div>
          )}
        </Container>
      </Section>
      <Section>
        <Container>
          <EventPageTabs
            eventinfo={eventinfo}
            participants={registrationsRes.data?.data ?? []}
            statistics={statisticsRes.data ?? {}}
            eventProducts={eventProductsRes.data ?? []}
            notifications={notifications}
            defaultTab={
              defaultTab as
                | 'participants'
                | 'overview'
                | 'dates'
                | 'descriptions'
                | 'certificate'
                | 'advanced'
                | 'communication'
                | 'products'
                | 'economy'
            }
          />
        </Container>
      </Section>
    </>
  );
}
