import { Heading } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';

import EventEditor from '@/app/admin/events/EventEditor';
import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { appConfig } from '@/config.server';
import { getAccessToken } from '@/utils/getAccesstoken';

type EditEventinfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function EditEventinfo({ params }: Readonly<EditEventinfoProps>) {
  const { id } = await params;
  const t = await getTranslations();

  const eventuras = createSDK({
    baseUrl: appConfig.env.NEXT_PUBLIC_BACKEND_URL as string,
    authHeader: await getAccessToken(),
  });

  const eventinfo = await apiWrapper(() =>
    eventuras.events.getV3Events1({
      id: id,
    })
  );

  if (!eventinfo.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch eventinfocollection ${id}, error: ${eventinfo.error}`
    );
  }

  if (!eventinfo.ok) {
    return <div>{t('common.event-not-found')}</div>;
  }

  return (
    <Wrapper>
      <Heading>{t(`admin.editEvent.content.title`)}</Heading>
      <EventEditor eventinfo={eventinfo.value!} />
    </Wrapper>
  );
}
