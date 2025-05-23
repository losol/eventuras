'use server';

import { EventFormDto } from '@eventuras/sdk';
import { Logger } from '@eventuras/utils';
import { redirect } from 'next/navigation';

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

  Logger.info({ namespace: 'eventcreator' }, `Creating event. ${JSON.stringify(newEvent)}`);

  const result = await apiWrapper(() =>
    eventuras.events.postV3Events({
      eventurasOrgId: organizationId,
      requestBody: newEvent,
    })
  );

  if (result.ok) {
    Logger.info({ namespace: 'admin:events' }, `On submit OK`, result.value);
    const nextUrl = `/admin/events/${result.value!.id}/edit`;
    redirect(nextUrl);
  } else {
    Logger.error({ namespace: 'admin:events' }, `On submit Error`, result.error);
  }
}
