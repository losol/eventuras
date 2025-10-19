import { Heading } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';

import EventEditor from '@/app/admin/events/EventEditor';
import Wrapper from '@/components/eventuras/Wrapper';
import { EventDto, getV3EventsById } from '@eventuras/event-sdk';
import { createClient } from '@/utils/apiClient';

type EditEventinfoProps = {
  params: Promise<{
    id: number;
  }>;
};

const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'page:editEvent' }
});

export default async function EditEventinfo({ params }: Readonly<EditEventinfoProps>) {
  const { id } = await params;
  const t = await getTranslations();

  const client = await createClient();

  let eventinfo: EventDto | null = null;
  let error: string | null = null;

  try {
    const response = await getV3EventsById({
      path: { id },
      client,
    });

    if (response.data) {
      eventinfo = response.data;
      logger.info({ eventId: id }, 'Successfully fetched event');
    } else if (response.error) {
      error = `Failed to fetch event ${id}: ${JSON.stringify(response.error)}`;
      logger.error({ eventId: id, error: response.error }, error);
    }
  } catch (err) {
    error = `Exception fetching event ${id}: ${err}`;
    logger.error({ eventId: id, err }, error);
  }

  if (!eventinfo) {
    return <div>{t('common.event-not-found')}</div>;
  }

  return (
    <Wrapper>
      <Heading>{t(`admin.editEvent.content.title`)}</Heading>
      <EventEditor eventinfo={eventinfo} />
    </Wrapper>
  );
}
