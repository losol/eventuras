'use server';

import { revalidatePath } from 'next/cache';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  type EmailNotificationDto,
  type EventParticipantsFilterDto,
  getV3EventsById,
  getV3Registrations,
  postV3NotificationsEmail,
  postV3NotificationsSms,
  type RegistrationDto,
  type SmsNotificationDto,
} from '@/lib/eventuras-sdk';
import {
  DEFAULT_RECIPIENT_STATUSES,
  DEFAULT_RECIPIENT_TYPES,
  type NotificationChannel,
  type NotificationRecipient,
  resolveNotificationRecipients,
} from '@/utils/api/notificationRecipients';
import { getOrganizationId } from '@/utils/organization';

const logger = Logger.create({
  namespace: 'web:actions',
  context: { module: 'NotificationActions' },
});

/**
 * Send email notification to event participants
 */
export async function sendEmailNotification(
  notification: EmailNotificationDto
): Promise<ServerActionResult<void>> {
  const organizationId = getOrganizationId();

  if (!organizationId) {
    const errorMsg = 'Organization ID not configured';
    logger.error({ organizationId }, errorMsg);
    return actionError(errorMsg, 'MISSING_ORG_ID');
  }

  const eventId = notification.eventParticipants?.eventId;
  logger.info(
    {
      eventId,
      organizationId,
      recipientCount: notification.eventParticipants?.registrationStatuses?.length,
    },
    'Sending email notification'
  );

  try {
    const response = await postV3NotificationsEmail({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      body: notification,
    });

    if (response.error) {
      logger.error(
        {
          error: response.error,
          eventId,
          organizationId,
          subject: notification.subject,
        },
        'Failed to send email notification'
      );
      return actionError('Failed to send email notification');
    }

    // Revalidate notifications pages
    if (eventId) {
      revalidatePath(`/admin/events/${eventId}`);
      revalidatePath(`/admin/notifications`);
    }

    logger.info({ eventId }, 'Email notification sent successfully');
    return actionSuccess(undefined, 'Email notification sent successfully!');
  } catch (error) {
    logger.error(
      {
        error,
        eventId,
        organizationId,
      },
      'Unexpected error sending email notification'
    );
    return actionError('An unexpected error occurred');
  }
}

/**
 * Send SMS notification to event participants
 */
export async function sendSmsNotification(
  notification: SmsNotificationDto
): Promise<ServerActionResult<void>> {
  const organizationId = getOrganizationId();

  if (!organizationId) {
    const errorMsg = 'Organization ID not configured';
    logger.error({ organizationId }, errorMsg);
    return actionError(errorMsg, 'MISSING_ORG_ID');
  }

  const eventId = notification.eventParticipants?.eventId;
  logger.info(
    {
      eventId,
      organizationId,
      recipientCount: notification.eventParticipants?.registrationStatuses?.length,
    },
    'Sending SMS notification'
  );

  try {
    const response = await postV3NotificationsSms({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      body: notification,
    });

    if (response.error) {
      logger.error(
        {
          error: response.error,
          eventId,
          organizationId,
          message: notification.message,
        },
        'Failed to send SMS notification'
      );
      return actionError('Failed to send SMS notification');
    }

    // Revalidate notifications pages
    if (eventId) {
      revalidatePath(`/admin/events/${eventId}`);
      revalidatePath(`/admin/notifications`);
    }

    logger.info({ eventId }, 'SMS notification sent successfully');
    return actionSuccess(undefined, 'SMS notification sent successfully!');
  } catch (error) {
    logger.error(
      {
        error,
        eventId,
        organizationId,
      },
      'Unexpected error sending SMS notification'
    );
    return actionError('An unexpected error occurred');
  }
}

/** Who a notification would actually reach, resolved from the filter that will be sent. */
export type NotificationAudience = {
  eventId: number;
  eventTitle: string;
  dateStart?: string | null;
  dateEnd?: string | null;
  recipients: NotificationRecipient[];
};

// 250 is the API's page maximum; the cap stops a runaway filter paging forever.
const RECIPIENT_PAGE_SIZE = 250;
const MAX_RECIPIENT_PAGES = 20;

/**
 * Resolves the recipients a notification would reach, so the admin can confirm
 * the audience before sending. Email is irreversible and goes to customers, and
 * the API cannot tell a right `eventId` from a wrong one — this is the only
 * place with enough context to catch a notification aimed at the wrong event.
 *
 * The event title and dates come from the `eventId` being sent, not from the
 * page, so a mismatch between the two is visible rather than hidden. Recipients
 * mirror the API's rules — the requested statuses and types, active users only,
 * and only those reachable on this channel — via `/v3/registrations`, which
 * additionally hides registrations this admin cannot access. The preview can
 * therefore be a subset of the real audience, never a superset.
 */
export async function previewEventNotificationRecipients(
  eventParticipants: EventParticipantsFilterDto,
  channel: NotificationChannel
): Promise<ServerActionResult<NotificationAudience>> {
  const eventId = eventParticipants?.eventId;
  if (!eventId) {
    logger.error({ eventParticipants }, 'Cannot resolve recipients without an event id');
    return actionError('No event selected', 'MISSING_EVENT_ID');
  }

  const statuses = eventParticipants.registrationStatuses?.length
    ? eventParticipants.registrationStatuses
    : DEFAULT_RECIPIENT_STATUSES;
  const types = eventParticipants.registrationTypes?.length
    ? eventParticipants.registrationTypes
    : DEFAULT_RECIPIENT_TYPES;

  try {
    const eventResponse = await getV3EventsById({ path: { id: eventId } });
    if (eventResponse.error || !eventResponse.data) {
      logger.error(
        { eventId, error: eventResponse.error },
        'Failed to load event for confirmation'
      );
      return actionError('Could not load the event', 'EVENT_NOT_FOUND');
    }

    const registrations: RegistrationDto[] = [];
    let drained = false;
    for (let page = 1; page <= MAX_RECIPIENT_PAGES && !drained; page++) {
      const response = await getV3Registrations({
        query: {
          EventId: eventId,
          Statuses: statuses,
          IncludeUserInfo: true,
          Page: page,
          Count: RECIPIENT_PAGE_SIZE,
        },
      });

      if (response.error) {
        logger.error(
          { eventId, page, error: response.error },
          'Failed to load registrations for confirmation'
        );
        return actionError('Could not load the recipient list', 'REGISTRATIONS_FAILED');
      }

      const batch = response.data?.data ?? [];
      registrations.push(...batch);
      drained = batch.length < RECIPIENT_PAGE_SIZE;
    }

    // A short list here would understate the audience, which is the exact
    // failure this step exists to catch. Refuse rather than preview a subset.
    if (!drained) {
      logger.error(
        { eventId, loaded: registrations.length },
        'Registrations exceeded the recipient page cap'
      );
      return actionError('Too many registrations to confirm', 'RECIPIENTS_TRUNCATED');
    }

    const recipients = resolveNotificationRecipients(registrations, types, channel);

    logger.info({ eventId, channel, recipientCount: recipients.length }, 'Resolved audience');

    return actionSuccess({
      eventId,
      eventTitle: eventResponse.data.title ?? `#${eventId}`,
      dateStart: eventResponse.data.dateStart,
      dateEnd: eventResponse.data.dateEnd,
      recipients,
    });
  } catch (error) {
    logger.error({ error, eventId, channel }, 'Unexpected error resolving audience');
    return actionError('An unexpected error occurred');
  }
}
