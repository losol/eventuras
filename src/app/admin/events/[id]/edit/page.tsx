'use client';

import createTranslation from 'next-translate/createTranslation';

import EventEditor from '@/app/admin/events/EventEditor';
import Loading from '@/components/ui/Loading';
import { useEvent } from '@/hooks/apiHooks';

type EditEventinfoProps = {
  params: {
    id: string;
  };
};

const EditEventinfo: React.FC<EditEventinfoProps> = ({ params }) => {
  const eventId = parseInt(params.id, 10);
  const { loading, event: eventinfo } = useEvent(eventId);
  const { t } = createTranslation();

  if (loading) {
    return <Loading />;
  }

  if (!eventinfo) {
    return <div>{t('common:event-not-found')}</div>;
  }

  return <EventEditor eventinfo={eventinfo} />;
};

export default EditEventinfo;
