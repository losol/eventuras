import { notFound } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { ErrorBlock } from '@eventuras/ratio-ui/blocks/Error';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { type EventAdminTab, PinEvent } from '@/components/admin/shell';
import {
  getV3EventsByEventIdProducts,
  getV3EventsByEventIdStatistics,
  getV3EventsById,
  getV3Notifications,
  getV3Registrations,
  NotificationDto,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

import EventAdminSections from './EventAdminSections';

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

  // A newly created event opens in the editor; otherwise the participant list.
  const isNewlyCreated = search.newlyCreated === 'true';
  const defaultTab: EventAdminTab = isNewlyCreated ? 'overview' : 'participants';

  const organizationId = getOrganizationId();

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
      getV3Notifications({
        headers: {
          'Eventuras-Org-Id': organizationId,
        },
        query: {
          EventId: id,
        },
      }),
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
  // Undefined while registrations failed to load, so the sidebar omits the count rather than showing 0.
  const registrations = registrationsRes?.data?.data;

  return (
    <Section>
      <Container>
        <PinEvent
          event={{
            id: eventinfo.id!,
            title: eventinfo.title ?? '',
            participantCount: registrations?.length,
          }}
        />
        {hasPartialErrors && (
          <div className="mb-6">
            <ErrorBlock type="generic" status="warning">
              <ErrorBlock.Title>Some Data Could Not Be Loaded</ErrorBlock.Title>
              <ErrorBlock.Description>
                The event information loaded successfully, but some additional data is temporarily
                unavailable:
              </ErrorBlock.Description>
              <ErrorBlock.Details>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {(!registrationsRes || !!registrationsRes?.error) && (
                    <li>Participant registrations</li>
                  )}
                  {(!eventProductsRes || !!eventProductsRes?.error) && <li>Event products</li>}
                  {(!statisticsRes || !!statisticsRes?.error) && <li>Event statistics</li>}
                  {!!notificationsRes?.error && <li>Notifications</li>}
                </ul>
              </ErrorBlock.Details>
            </ErrorBlock>
          </div>
        )}
        <EventAdminSections
          eventinfo={eventinfo}
          participants={registrations ?? []}
          statistics={statisticsRes.data ?? {}}
          eventProducts={eventProductsRes.data ?? []}
          notifications={notifications}
          organizationId={organizationId ?? 0}
          defaultTab={defaultTab}
        />
      </Container>
    </Section>
  );
}
