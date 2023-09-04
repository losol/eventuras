'use client';

import EventEditor from '@/app/admin/components/EventEditor';
import { Loading } from '@/components/feedback';
import { useEvent } from '@/hooks/apiHooks';

const EditEvent = ({ params }: { params: any }) => {
  const eventId = parseInt(params.id as string, 10);
  const { loading, event } = useEvent(eventId);
  if (loading) {
    return <Loading />;
  }
  return <EventEditor event={event} />;
};
export default EditEvent;
