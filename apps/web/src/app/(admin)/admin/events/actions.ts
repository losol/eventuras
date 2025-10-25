'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { appConfig } from '@/config.server';
import { client } from '@/lib/eventuras-client';
import {
  EventFormDto,
  postV3EventByIdCertificatesIssue,
  postV3Events,
  putV3EventsById,
} from '@/lib/eventuras-sdk';

/**
 * Get the organization ID from the app configuration
 * @returns The organization ID as a number, or null if not configured
 */
function getOrganizationId(): number | null {
  const orgId = appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID;

  if (typeof orgId === 'number') {
    return orgId;
  }

  if (typeof orgId === 'string' && orgId.trim() !== '') {
    const parsed = parseInt(orgId, 10);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:createEvent' },
});

export async function createEvent(
  prevState: ServerActionResult<{ eventId: number }> | null,
  formData: FormData
): Promise<ServerActionResult<{ eventId: number }>> {
  logger.info('Starting event creation');

  try {
    // Get organization ID from form or config
    const orgIdFromForm = formData.get('organizationId')?.toString();
    let organizationId: number | null = null;

    if (orgIdFromForm && orgIdFromForm.trim() !== '') {
      const parsed = parseInt(orgIdFromForm, 10);
      organizationId = isNaN(parsed) ? null : parsed;
      logger.info({ orgIdFromForm, organizationId }, 'Using organization ID from form');
    } else {
      organizationId = getOrganizationId();
      logger.info({ organizationId }, 'Using organization ID from config');
    }

    if (!organizationId) {
      const errorMsg = 'Invalid or missing organization ID. Please check your configuration.';
      logger.error({ orgIdFromForm, organizationId }, errorMsg);
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

    const response = await postV3Events({
      client,
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
      body: newEvent,
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

    // Revalidate ISR caches to show new event immediately
    revalidatePath('/'); // Frontpage event grid
    revalidatePath('/events'); // Events list page (if exists)

    // Redirect to event page with newlyCreated flag to show edit tab
    redirect(`/admin/events/${eventId}?newlyCreated=true`);
  } catch (error) {
    // Handle redirect errors (Next.js redirects throw NEXT_REDIRECT)
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      logger.info('Redirect initiated successfully');
      throw error; // Re-throw redirect
    }

    // Handle all other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
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
  context: { module: 'action:updateEvent' },
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

    updateLogger.debug(
      {
        eventId,
        organizationId: eventData.organizationId,
        updateDataKeys: Object.keys(eventData),
        title: eventData.title,
        slug: eventData.slug,
        status: eventData.status,
        type: eventData.type,
      },
      'Prepared update request with organizationId'
    );

    const response = await putV3EventsById({
      client,
      path: {
        id: eventId,
      },
      body: eventData,
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
        userMessage = err.body?.message || err.message || err.statusText || userMessage;
      }

      return actionError(userMessage, 'API_ERROR', errorDetails);
    }

    updateLogger.info({ eventId }, 'Event updated successfully');

    // Revalidate ISR caches to show updated event immediately
    revalidatePath('/'); // Frontpage event grid
    revalidatePath(`/events/${eventId}`); // Event detail page redirects
    revalidatePath('/events'); // Events list page (if exists)

    return actionSuccess({ eventId }, 'Event updated successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    updateLogger.error(
      {
        eventId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
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

const certificateLogger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:issueCertificates' },
});

/**
 * Issue and send certificates for an event
 */
export async function issueCertificates(eventId: number): Promise<ServerActionResult<void>> {
  certificateLogger.info({ eventId }, 'Issuing certificates for event');

  try {
    // Validate event ID
    if (!eventId || isNaN(eventId)) {
      const errorMsg = 'Invalid event ID';
      certificateLogger.error({ eventId }, errorMsg);
      return actionError(errorMsg, 'INVALID_EVENT_ID');
    }

    // Get organization ID from config
    const organizationId = getOrganizationId();

    if (!organizationId) {
      const errorMsg = 'Organization ID not configured';
      certificateLogger.error({ organizationId }, errorMsg);
      return actionError(errorMsg, 'MISSING_ORG_ID');
    }

    certificateLogger.info({ eventId, organizationId }, 'Sending certificate issue request to API');

    const response = await postV3EventByIdCertificatesIssue({
      client,
      path: { id: eventId },
      query: { send: true },
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
    });

    // The API returns unknown, so we check if there's an error
    if (response.error) {
      const errorMsg = 'Failed to issue certificates';
      certificateLogger.error(
        {
          eventId,
          organizationId,
          error: response.error,
        },
        errorMsg
      );
      return actionError(errorMsg, 'API_ERROR');
    }

    // Revalidate paths that might display certificate status
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}/certificates`);
    revalidatePath('/admin/events');

    certificateLogger.info({ eventId }, 'Certificates issued successfully');

    return actionSuccess(undefined, 'Certificates sent successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    certificateLogger.error(
      {
        eventId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      'Failed to issue certificates'
    );

    return actionError(
      `Failed to issue certificates: ${errorMessage}`,
      'ISSUE_CERTIFICATES_FAILED',
      error instanceof Error ? { name: error.name, message: error.message } : error
    );
  }
}
