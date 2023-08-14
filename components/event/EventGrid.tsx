import { EventDto } from '@losol/eventuras';

import EventCard from './EventCard';

interface EventGridProps {
  eventinfos: EventDto[];
}

const EventGrid: React.FC<EventGridProps> = ({ eventinfos }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {eventinfos.map(eventinfo => (
      <EventCard key={eventinfo.id} eventinfo={eventinfo} />
    ))}
  </div>
);

export default EventGrid;
