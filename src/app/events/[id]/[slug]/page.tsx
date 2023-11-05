import { redirect } from 'next/navigation';

import { Container, Layout } from '@/components/ui';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import createSDK from '@/utils/createSDK';

import EventDetails from '../components/EventDetails';
import EventRegistrationButton from '../components/EventRegistrationButton';

type EventInfoProps = {
  params: {
    id: number;
    slug: string;
  };
};

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const eventuras = createSDK();
  const events = await eventuras.events.getV3Events({});
  if (events && events.data && events.data.length) {
    return events.data.map(event => ({ id: event.id?.toString() }));
  }

  return [];
}

const Page: React.FC<EventInfoProps> = async ({ params }) => {
  const eventuras = createSDK();

  const eventinfo = await eventuras.events.getV3Events1({ id: params.id });
  if (!eventinfo) return <div>Event not found</div>;

  if (params.slug !== eventinfo.slug) {
    redirect(`/events/${eventinfo.id!}/${eventinfo.slug!}`);
  }

  return (
    <Layout fluid>
      {eventinfo?.featuredImageUrl && (
        <Card
          className="mx-auto min-h-[33vh]"
          {...(eventinfo?.featuredImageUrl && { backgroundImage: eventinfo.featuredImageUrl })}
        ></Card>
      )}
      <section className="py-16">
        <Container>
          <Heading as="h1" className="pt-12">
            {eventinfo?.title ?? 'Mysterious Event'}
          </Heading>
          {eventinfo?.description}
          <EventRegistrationButton eventId={eventinfo.id!} />
        </Container>
      </section>

      <EventDetails eventinfo={eventinfo} />
    </Layout>
  );
};

export default Page;
