'use client';
import createTranslation from 'next-translate/createTranslation';

import EventEditor from '@/app/admin/events/EventEditor';
import { Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import useCreateHook from '@/hooks/createHook';
import { createSDK } from '@/utils/api/EventurasApi';

type EditEventinfoProps = {
  params: {
    id: string;
  };
};

const EditEventinfo: React.FC<EditEventinfoProps> = ({ params }) => {
  const eventId = parseInt(params.id, 10);
  const { result, loading } = useCreateHook(
    () => createSDK().events.getV3Events1({ id: eventId }),
    [eventId]
  );
  const { t } = createTranslation();

  if (loading) return null;
  if (!result) {
    return <div>{t('common:event-not-found')}</div>;
  }
  return (
    <Layout>
      <Heading>{t(`admin:editEvent.content.title`)}</Heading>
      <p>{t(`admin:editEvent.content.description`)}</p>
      <EventEditor eventinfo={result} />
    </Layout>
  );
};

export default EditEventinfo;
