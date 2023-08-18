import { EventDto } from '@losol/eventuras';
import { useEffect, useRef, useState } from 'react';

import { getEvent } from '@/utils/api/functions/events';

const useEvent = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getEvent(eventRef.current.toString());
      setLoading(false);
      if (result.ok) {
        setEvent(result.value);
        return;
      }
      setEvent(null);
    };
    execute();
  }, []);
  return { loading, event };
};

export default useEvent;
