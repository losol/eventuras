import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import EventCard from '@/components/event/EventCard';
import { EventDto } from '@/lib/eventuras-sdk';
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
