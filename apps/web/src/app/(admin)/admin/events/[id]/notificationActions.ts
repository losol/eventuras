'use server';

import { actionError, actionSuccess, ServerActionResult } from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import {
  getV3Notifications,
  getV3NotificationsByIdRecipients,
  NotificationDto,
} from '@/lib/eventuras-sdk';

const logger = Logger.create({
  namespace: 'web:admin:events',
  context: { module: 'notificationActions' },
});

type NotificationListResponse = {
  total: number;
  data: NotificationDto[];
};

export type RecipientDto = {
  notificationRecipientId?: number;
  notificationId?: number;
  recipientUserId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientPhoneNumber?: string | null;
  sent?: string | null;
  created?: string;
  errors?: string | null;
};

type RecipientsResponse = {
  data?: RecipientDto[];
  total?: number;
};

/**
 * Server action to fetch notifications for a specific event
 * @param eventId - The event ID to fetch notifications for
 * @returns List of notifications or error
 */
export async function fetchEventNotifications(
  eventId: number
): Promise<ServerActionResult<NotificationDto[]>> {
  try {
    logger.info({ eventId }, 'Fetching notifications for event');

    const organizationId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
    if (!organizationId || typeof organizationId !== 'number') {
      logger.error({ eventId }, 'NEXT_PUBLIC_ORGANIZATION_ID is not configured properly');
      return actionError('Configuration error');
    }

    const response = await getV3Notifications({
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      query: {
        EventId: eventId,
      },
    });

    if (!response.data) {
      logger.error({ eventId, error: response.error }, 'Failed to fetch notifications');
      return actionError('Failed to load notifications');
    }

    const notificationData = response.data as NotificationListResponse;
    const notifications = notificationData.data || [];

    logger.info({ eventId, count: notifications.length }, 'Notifications fetched successfully');

    return actionSuccess(notifications);
  } catch (error) {
    logger.error({ error, eventId }, 'Error fetching notifications');
    return actionError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Server action to fetch recipients for a specific notification
 * @param notificationId - The notification ID to fetch recipients for
 * @returns List of recipients or error
 */
export async function fetchNotificationRecipients(
  notificationId: number
): Promise<ServerActionResult<RecipientDto[]>> {
  try {
    logger.info({ notificationId }, 'Fetching recipients for notification');

    const response = await getV3NotificationsByIdRecipients({
      path: { id: notificationId },
      query: {
        Limit: 100,
      },
    });

    if (!response.data) {
      logger.error({ notificationId, error: response.error }, 'Failed to fetch recipients');
      return actionError('Failed to load recipients');
    }

    const recipientsData = response.data as RecipientsResponse;
    const recipients = recipientsData.data || [];

    logger.info({ notificationId, count: recipients.length }, 'Recipients fetched successfully');

    return actionSuccess(recipients);
  } catch (error) {
    logger.error({ error, notificationId }, 'Error fetching recipients');
    return actionError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
