import { Heading } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';

import EventEditor from '@/app/admin/events/EventEditor';
import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { authConfig } from '@/utils/authconfig';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

type EditEventinfoProps = {
  params: {
    id: string;
  };
};

const EditEventinfo: React.FC<EditEventinfoProps> = async ({ params }) => {
  const eventId = parseInt(params.id);
  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const eventinfo = await apiWrapper(() =>
    eventuras.events.getV3Events1({
      id: eventId,
    })
  );

  if (!eventinfo.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch eventinfo ${eventId}, error: ${eventinfo.error}`
    );
  }

  if (!eventinfo.ok) {
    return <div>{t('common:event-not-found')}</div>;
  }

  return (
    <Wrapper>
      <Heading>{t(`admin:editEvent.content.title`)}</Heading>
      <EventEditor eventinfo={eventinfo.value!} />
    </Wrapper>
  );
};

export default EditEventinfo;
