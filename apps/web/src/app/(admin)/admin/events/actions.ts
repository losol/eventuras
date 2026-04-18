'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
import {
  EventFormDto,
  getV3EventByIdCertificatesPreview,
  postV3EventByIdCertificatesIssue,
  postV3Events,
  putV3EventsById,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

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
      const parsed = Number.parseInt(orgIdFromForm, 10);
      organizationId = Number.isNaN(parsed) ? null : parsed;
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

    if (response.error) {
      const err = response.error as Record<string, unknown>;
      const detail = (err?.message ?? err?.title ?? JSON.stringify(err)) as string;
      logger.error({ organizationId, title, error: response.error }, 'Event creation failed');
      return actionError(`Event creation failed: ${detail}`, 'API_ERROR');
    }

    if (!response.data) {
      logger.error(
        { organizationId, title, status: response.response?.status },
        'No data returned from event creation'
      );
      return actionError('No data returned from event creation', 'NO_DATA_RETURNED');
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

/**
 * Extract a readable message from the SDK's `error` object. Handles ASP.NET
 * Problem Details (RFC 7807) validation errors — `{ errors: { Field: [msgs] } }`
 * — by surfacing per-field issues instead of the generic "Bad Request".
 */
function formatApiError(raw: unknown): string {
  const fallback = 'An error occurred while updating the event';
  if (!raw || typeof raw !== 'object') return fallback;

  const err = raw as {
    errors?: Record<string, string[] | string | undefined>;
    title?: string;
    body?: { message?: string };
    message?: string;
    statusText?: string;
  };

  if (err.errors && typeof err.errors === 'object') {
    const parts = Object.entries(err.errors)
      .map(([field, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(', ') : msgs;
        return text ? `${field}: ${text}` : field;
      })
      .filter(Boolean);
    if (parts.length > 0) {
      const prefix = err.title ? `${err.title} — ` : '';
      return `${prefix}${parts.join('; ')}`;
    }
  }

  return err.body?.message || err.message || err.statusText || fallback;
}

export async function updateEvent(
  eventId: number,
  eventData: EventFormDto
): Promise<ServerActionResult<{ eventId: number }>> {
  updateLogger.info({ eventId }, 'Starting event update');

  try {
    // Validate event ID
    if (!eventId || Number.isNaN(eventId)) {
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

      const userMessage = formatApiError(response.error);
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
    if (!eventId || Number.isNaN(eventId)) {
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

const previewLogger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:previewCertificate' },
});

/**
 * Preview the certificate template for an event with dummy data
 */
export async function previewCertificate(eventId: number): Promise<ServerActionResult<string>> {
  previewLogger.info({ eventId }, 'Previewing certificate for event');

  try {
    if (!eventId || Number.isNaN(eventId)) {
      return actionError('Invalid event ID', 'INVALID_EVENT_ID');
    }

    const organizationId = getOrganizationId();
    if (!organizationId) {
      return actionError('Organization ID not configured', 'MISSING_ORG_ID');
    }

    const response = await getV3EventByIdCertificatesPreview({
      client,
      path: { id: eventId },
      headers: {
        'Eventuras-Org-Id': organizationId,
      },
    });

    if (response.error) {
      previewLogger.error({ eventId, error: response.error }, 'Failed to preview certificate');
      return actionError('Failed to preview certificate', 'API_ERROR');
    }

    if (typeof response.data !== 'string') {
      previewLogger.error({ eventId }, 'Invalid certificate preview response');
      return actionError('Invalid certificate preview response', 'INVALID_PREVIEW_PAYLOAD');
    }

    return actionSuccess(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    previewLogger.error({ eventId, error }, 'Failed to preview certificate');
    return actionError(`Failed to preview certificate: ${errorMessage}`, 'PREVIEW_FAILED');
  }
}
