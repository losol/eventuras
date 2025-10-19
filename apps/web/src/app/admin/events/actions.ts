'use server';

import { Logger } from '@eventuras/logger';
import { postV3Events, putV3EventsById, EventFormDto } from '@eventuras/event-sdk';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/apiClient';
import { appConfig } from '@/config.server';
import { actionError, actionSuccess, type ServerActionResult } from '@/types/serverAction';

const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:createEvent' }
});

export async function createEvent(
  formData: FormData
): Promise<ServerActionResult<{ eventId: number }>> {
  logger.info('Starting event creation');

  try {
    // Extract and validate organization ID
    const orgIdFromForm = formData.get('organizationId')?.toString();
    logger.info({ orgIdFromForm, configOrgId: appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID }, 'Extracting organization ID');

    // Try parsing form value first, then fall back to config
    let organizationId: number | undefined;

    if (orgIdFromForm && orgIdFromForm.trim() !== '') {
      organizationId = parseInt(orgIdFromForm, 10);
      logger.info({ orgIdFromForm, parsedOrgId: organizationId }, 'Parsed organization ID from form');
    } else {
      // Fall back to config value
      const configOrgId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;
      if (typeof configOrgId === 'number') {
        organizationId = configOrgId;
      } else if (typeof configOrgId === 'string' && configOrgId.trim() !== '') {
        organizationId = parseInt(configOrgId, 10);
      }
      logger.info({ configOrgId, parsedOrgId: organizationId }, 'Using organization ID from config');
    }

    if (!organizationId || isNaN(organizationId)) {
      const errorMsg = 'Invalid or missing organization ID. Please check your configuration.';
      logger.error({
        orgIdFromForm,
        configOrgId: appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID,
        parsedOrgId: organizationId
      }, errorMsg);
      return actionError(errorMsg, 'INVALID_ORG_ID', { orgIdFromForm });
    }

    // Extract and validate title
    const title = formData.get('title')?.toString()?.trim();
    if (!title || title.length === 0) {
      const errorMsg = 'Event title is required';
      logger.error({ title }, errorMsg);
      return actionError(errorMsg, 'INVALID_TITLE');
    }

    const slug = crypto.randomUUID();

    logger.info({ organizationId, title, slug }, 'Preparing event creation');

    // Create event payload
    const newEvent: EventFormDto = {
      organizationId,
      title,
      slug,
    };

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
      const errorMsg = 'No data returned from event creation';
      logger.error({ organizationId, title, response }, errorMsg);
      return actionError(errorMsg, 'NO_DATA_RETURNED');
    }

    const eventId = response.data.id;
    if (!eventId) {
      const errorMsg = 'Event ID missing in response';
      logger.error({ organizationId, title, response }, errorMsg);
      return actionError(errorMsg, 'MISSING_EVENT_ID');
    }

    logger.info({ eventId, organizationId, title }, 'Event created successfully');

    // Redirect to edit page
    redirect(`/admin/events/${eventId}/edit`);

  } catch (error) {
    // Handle redirect errors (Next.js redirects throw NEXT_REDIRECT)
    if (error && typeof error === 'object' && 'digest' in error &&
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      logger.info('Redirect initiated successfully');
      throw error; // Re-throw redirect
    }

    // Handle all other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(
      {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      },
      'Failed to create event'
    );

    return actionError(
      `Failed to create event: ${errorMessage}`,
      'CREATE_EVENT_FAILED',
      error instanceof Error ? { name: error.name, message: error.message } : error
    );
  }
}

const updateLogger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:updateEvent' }
});

export async function updateEvent(
  eventId: number,
  eventData: EventFormDto
): Promise<ServerActionResult<{ eventId: number }>> {
  updateLogger.info({ eventId }, 'Starting event update');

  try {
    // Validate event ID
    if (!eventId || isNaN(eventId)) {
      const errorMsg = 'Invalid event ID';
      updateLogger.error({ eventId }, errorMsg);
      return actionError(errorMsg, 'INVALID_EVENT_ID');
    }

    updateLogger.info({ eventId }, 'Sending update event request to API');

    // Ensure organizationId is present and valid
    if (!eventData.organizationId) {
      const errorMsg = 'Organization ID is required for event updates';
      updateLogger.error({ eventId, eventData }, errorMsg);
      return actionError(errorMsg, 'MISSING_ORG_ID');
    }

    updateLogger.debug({
      eventId,
      organizationId: eventData.organizationId,
      updateDataKeys: Object.keys(eventData),
      title: eventData.title,
      slug: eventData.slug,
      status: eventData.status,
      type: eventData.type,
    }, 'Prepared update request with organizationId');

    const client = await createClient();
    const response = await putV3EventsById({
      path: {
        id: eventId,
      },
      body: eventData,
      client,
    });

    if (!response.data) {
      const errorMsg = 'Failed to update event - API returned an error';

      // Try to extract error details from the response
      const errorDetails: Record<string, unknown> = {
        hasResponse: !!response.response,
        responseStatus: (response.response as unknown as { status?: number })?.status,
        responseStatusText: (response.response as unknown as { statusText?: string })?.statusText,
      };

      if (response.error) {
        errorDetails.error = response.error;
      }

      updateLogger.error({ eventId, ...errorDetails }, errorMsg);

      // Provide user-friendly error message
      let userMessage = 'An error occurred while updating the event';

      // Try to get message from various possible error structures
      const err = response.error as unknown as {
        body?: { message?: string };
        message?: string;
        statusText?: string;
      };

      if (err) {
        userMessage = err.body?.message
          || err.message
          || err.statusText
          || userMessage;
      }

      return actionError(
        userMessage,
        'API_ERROR',
        errorDetails
      );
    }

    updateLogger.info({ eventId }, 'Event updated successfully');

    return actionSuccess(
      { eventId },
      'Event updated successfully'
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    updateLogger.error(
      {
        eventId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      },
      'Failed to update event'
    );

    return actionError(
      `Failed to update event: ${errorMessage}`,
      'UPDATE_EVENT_FAILED',
      error instanceof Error ? { name: error.name, message: error.message } : error
    );
  }
}
