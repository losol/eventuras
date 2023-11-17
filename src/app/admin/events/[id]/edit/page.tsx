import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import EventEditor from '@/app/admin/events/EventEditor';
import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import createSDK from '@/utils/createSDK';

type EditEventinfoProps = {
  params: {
    id: string;
  };
};

const EditEventinfo: React.FC<EditEventinfoProps> = async ({ params }) => {
  const eventId = parseInt(params.id, 10);
  const eventuras = createSDK({ authHeader: headers().get('Authorization') });
  const eventInfo = await eventuras.events.getV3Events1({ id: eventId });
  const { t } = createTranslation();

  if (!eventInfo) {
    return <div>{t('common:event-not-found')}</div>;
  }

  return (
    <Layout>
      <Heading>{t(`admin:editEvent.content.title`)}</Heading>
      <p>{t(`admin:editEvent.content.description`)}</p>
      <EventEditor eventinfo={eventInfo} />
    </Layout>
  );
};

export default EditEventinfo;
