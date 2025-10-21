import { EventDto } from '@eventuras/event-sdk';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import EventCard from '@/components/event/EventCard';
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
