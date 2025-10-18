'use server';

import { Logger } from '@eventuras/logger';
import { postV3Events, EventFormDto } from '@eventuras/event-sdk';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/apiClient';
import { appConfig } from '@/config.server';

const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:createEvent' }
});

export async function createEvent(formData: FormData) {
  logger.info('Starting event creation');

  // Extract and validate organization ID
  const orgIdFromForm = formData.get('organizationId')?.toString();
  const organizationId = parseInt(
    orgIdFromForm ?? appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string
  );

  if (!organizationId || isNaN(organizationId)) {
    logger.error({ orgIdFromForm }, 'Invalid or missing organization ID');
    return;
  }

  // Extract title with default
  const title = formData.get('title')?.toString() ?? 'New event';
  const slug = crypto.randomUUID();

  logger.info({ organizationId, title, slug }, 'Preparing event creation');

  // Create event payload
  const newEvent: EventFormDto = {
    organizationId,
    title,
    slug,
  };

  try {
    logger.info({ event: newEvent }, 'Sending create event request to API');

    const client = await createClient();
    const response = await postV3Events({
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      body: newEvent,
      client,
    });

    if (!response.data) {
      logger.error({ organizationId, title }, 'No data returned from event creation');
      return;
    }

    const eventId = response.data.id;
    const redirectUrl = `/admin/events/${eventId}/edit`;

    logger.info({ eventId, redirectUrl }, 'Event created successfully, redirecting');

    redirect(redirectUrl);
  } catch (error) {
    logger.error(
      {
        organizationId,
        title,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      },
      'Failed to create event'
    );
    throw error;
  }
}
