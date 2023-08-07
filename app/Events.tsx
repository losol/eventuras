import { EventsService } from '@losol/eventuras';

import { Heading } from '../components/content';
import EventsGrid from '../components/event/common/EventsGrid';
//import { Loading } from '../components/feedback';

//{
//  events: EventDto[];
//  locales: LocalesType;
//}

async function getData() {
  const events = await EventsService.getV3Events({}).catch(() => {
    return { data: [] };
  });

  return events.data;
}

export default async function Page() {
  const eventData = await getData();

  return (
    <>
      <Heading as="h2">Events</Heading>

      {eventData && eventData.length > 0 ? (
        <EventsGrid events={eventData} />
      ) : (
        <p className="font-normal">More events TBA</p>
      )}
    </>
  );
}
