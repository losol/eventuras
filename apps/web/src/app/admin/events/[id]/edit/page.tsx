import Heading from '@eventuras/ui/Heading';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import EventEditor from '@/app/admin/events/EventEditor';
import FixedContainer from '@/components/eventuras/navigation/FixedContainer';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

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
    authHeader: headers().get('Authorization'),
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
    <FixedContainer>
      <Heading>{t(`admin:editEvent.content.title`)}</Heading>
      <EventEditor eventinfo={eventinfo.value!} />
    </FixedContainer>
  );
};

export default EditEventinfo;
