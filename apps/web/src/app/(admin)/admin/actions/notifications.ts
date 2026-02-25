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
  postV3NotificationsEmail,
  postV3NotificationsSms,
  type SmsNotificationDto,
} from '@/lib/eventuras-sdk';
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
