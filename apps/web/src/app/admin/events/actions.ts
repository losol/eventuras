'use server';

import { EventFormDto } from '@eventuras/sdk';
import { Logger } from '@eventuras/logger';
import { redirect } from 'next/navigation';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

export async function createEvent(formData: FormData) {
  const logger = Logger.create({ 
    namespace: 'web:admin:events',
    context: { action: 'createEvent' }
  });

  // Validate required fields
  if (formData.get('organizationId') == null) {
    logger.warn('Missing organizationId in form data');
    return;
  }

  const organizationId = parseInt(
    formData.get('organizationId')?.toString() ?? appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string
  );
  const title = formData.get('title')?.toString() ?? 'New event';

  logger.info(
    { organizationId, title },
    'Creating event'
  );

  const eventuras = createSDK({
    baseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string,
    authHeader: await getAccessToken(),
  });

  const newEvent: EventFormDto = {
    organizationId: organizationId,
    title: title,
    slug: crypto.randomUUID(),
  };

  const result = await apiWrapper(() =>
    eventuras.events.postV3Events({
      eventurasOrgId: organizationId,
      requestBody: newEvent,
    })
  );

  if (result.ok) {
    const eventId = result.value!.id;
    const nextUrl = `/admin/events/${eventId}/edit`;
    
    logger.info(
      { eventId, redirectTo: nextUrl },
      'Event created successfully'
    );
    
    redirect(nextUrl);
  } else {
    logger.error(
      { 
        organizationId,
        errorMessage: result.error?.message ?? 'Unknown error',
        errorStatus: result.error?.status 
      },
      'Failed to create event'
    );
  }
}
