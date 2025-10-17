'use server';

import { EventFormDto } from '@eventuras/sdk';
import { Logger } from '@eventuras/logger';
import { redirect } from 'next/navigation';

const logger = Logger.create({ namespace: 'EventActions' });

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

export async function createEvent(formData: FormData) {
  if (formData.get('organizationId') == null) return;
  const organizationId = parseInt(
    formData.get('organizationId')?.toString() ?? Environment.NEXT_PUBLIC_ORGANIZATION_ID
  );
  const title = formData.get('title')?.toString() ?? 'New event';

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const newEvent: EventFormDto = {
    organizationId: organizationId,
    title: title,
    slug: crypto.randomUUID(),
  };

  logger.info({ event: newEvent }, 'Creating event');

  const result = await apiWrapper(() =>
    eventuras.events.postV3Events({
      eventurasOrgId: organizationId,
      requestBody: newEvent,
    })
  );

  if (result.ok) {
    logger.info({ event: result.value }, 'Event created successfully');
    const nextUrl = `/admin/events/${result.value!.id}/edit`;
    redirect(nextUrl);
  } else {
    logger.error({ error: result.error }, 'Failed to create event');
  }
}
