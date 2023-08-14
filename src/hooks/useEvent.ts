import { EventDto, OpenAPI } from '@losol/eventuras';
import { useEffect, useRef, useState } from 'react';

/*
  Sometimes mysterious going on with the losol SDK => network call completes succesfully, but promise never resolved.
  For now lets wrap these calls ourselves
*/

const getAPIEvent = ({ id }: { id: number }) =>
  fetch(`${OpenAPI.BASE}/${process.env.NEXT_PUBLIC_API_VERSION}/events/${id}`).then(r => r.json());

const useEvent = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //TODO handle edge cases
  useEffect(() => {
    const execute = async () => {
      const event: EventDto | null = await getAPIEvent({
        id: eventRef.current,
      }).catch(err => {
        console.error(err);
        return null;
      });
      setEvent(event);
      setLoading(false);
    };
    execute();
  }, []);
  return { loading, event };
};

export default useEvent;
