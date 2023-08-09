import { EventDto, EventsService } from '@losol/eventuras';
import { Card, Heading, Text } from 'components/content';
import { Loading } from 'components/feedback';
import { Layout } from 'components/layout';
import Link from 'next/link';
import getT from 'next-translate/getT';
import { LocalesType } from 'types';

type IndexProps = {
  events: EventDto[];
  locales: LocalesType;
};

export default function Index(props: IndexProps) {
  const { events, locales } = props;
  const { demoTitleLocale, demoTextLocale } = locales.component;
  const { eventsTitle } = locales.common;

  return (
    <Layout>
      <Heading as="h1">{demoTitleLocale}</Heading>
      <Text>{demoTextLocale}</Text>
      {!events && <Loading />}
      {events.length !== 0 && (
        <>
          <Heading as="h2">{eventsTitle}</Heading>
          <div className="grid grid-cols-4 gap-4">
            {events?.map((event: EventDto) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card key={event.id}>
                  <Card.Heading>{event.title}</Card.Heading>
                  <Card.Text>{event.description!}</Card.Text>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const events = await EventsService.getV3Events({}).catch(() => {
    return { data: [] };
  });

  // Locales
  const translateComponent = await getT(locale, 'index');
  const demoTitleLocale = translateComponent('demoTitle');
  const demoTextLocale = translateComponent('demoText');

  const translateCommon = await getT(locale, 'common');
  const eventsTitle = translateCommon('events');

  return {
    props: {
      events: events.data,
      locales: {
        component: {
          demoTitleLocale,
          demoTextLocale,
        },
        common: {
          eventsTitle,
        },
      },
    },
    revalidate: 1, // In seconds
  };
}
