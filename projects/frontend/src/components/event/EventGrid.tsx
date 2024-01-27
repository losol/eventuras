import { EventDto } from '@losol/eventuras';

import EventCard from '@/components/event/EventCard';
import Grid from '@/components/ui/Grid';

interface EventGridProps {
  eventinfos: EventDto[];
}

const EventGrid: React.FC<EventGridProps> = ({ eventinfos }) => {
  return (
    <Grid>
      {eventinfos.map(eventinfo => (
        <EventCard key={eventinfo.id} eventinfo={eventinfo} />
      ))}
    </Grid>
  );
};

export default EventGrid;
