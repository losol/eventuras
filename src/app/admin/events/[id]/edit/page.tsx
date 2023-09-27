'use client';

import EventEditor from '@/app/admin/events/EventEditor';
import { Loading } from '@/components/feedback';
import { useEvent } from '@/hooks/apiHooks';

type EditEventinfoProps = {
  params: {
    id: string;
  };
};

const EditEventinfo: React.FC<EditEventinfoProps> = ({ params }) => {
  const eventId = parseInt(params.id, 10);
  const { loading, event: eventinfo } = useEvent(eventId);

  if (loading) {
    return <Loading />;
  }

  if (!eventinfo) {
    return <div>Event not found</div>;
  }

  return <EventEditor eventinfo={eventinfo} />;
};

export default EditEventinfo;
