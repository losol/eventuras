import { EventsService } from '@losol/eventuras';

import EventPage from './(components)/EventPage';

type EventInfoProps = {
  params: {
    id: number;
  };
};

async function getEvent(id: number) {
  return await EventsService.getV3Events1({ id }).catch(null);
}

const EventInfo = async ({ params }: EventInfoProps) => {
  const event = await getEvent(params.id);

  if (!event) return <div>Event not found</div>;

  return <EventPage event={event} />;
};

export default EventInfo;
