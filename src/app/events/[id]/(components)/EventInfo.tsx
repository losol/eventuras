import { EventsService, OpenAPI } from '@losol/eventuras';
import { RedirectType } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';

import { Container, Layout } from '@/components/layout';
import Logger from '@/utils/Logger';

import EventDetails from '../(components)/EventDetails';

type EventInfoProps = {
  params: {
    id: number;
    slug: string;
  };
};
OpenAPI.BASE = process.env.API_BASE_URL!;
OpenAPI.VERSION = process.env.NEXT_PUBLIC_API_VERSION!;
const l = { namespace: 'events:detail' };
async function getEvents() {
  return await EventsService.getV3Events({}).catch(e => {
    Logger.error(l, 'Error fetching events:', e);
    return null;
  });
}

async function getEvent(id: number) {
  return await EventsService.getV3Events1({ id }).catch(e => {
    Logger.error(l, 'Error fetching events:', e);
    return null;
  });
}

export async function generateStaticParams() {
  const events = await getEvents();
  if (events && events.data && events.data.length) {
    return events.data.map(event => ({ id: event.id?.toString() }));
  }

  return [];
}

const EventInfo: React.FC<EventInfoProps> = async ({ params }) => {
  const eventinfo = await getEvent(params.id);
  if (!eventinfo) return <div>Event not found</div>;

  if (params.slug !== eventinfo.slug) {
    //TODO replace with permanentDirect once it has been deployed to stable nextjs
    //@see https://github.com/vercel/next.js/pull/54047
    redirect(eventinfo.slug!, RedirectType.replace);
  }

  return (
    <Layout>
      <Container>
        <EventDetails eventinfo={eventinfo} />
      </Container>
    </Layout>
  );
};

export default EventInfo;
