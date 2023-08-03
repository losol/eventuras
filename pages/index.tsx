import { EventDto, EventsService } from '@losol/eventuras';
import { SimpleGrid } from '@mantine/core';
import { Card } from 'components/datadisplay';
import { Loading } from 'components/feedback';
import { Layout } from 'components/layout';
import { Heading, Text } from 'components/typography';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  const { locale } = useRouter();

  return (
    <Layout>
      <Heading as="h1">
        {demoTitleLocale} {locale?.toUpperCase()}
      </Heading>
      <Text>{demoTextLocale}</Text>
      {!events && <Loading />}
      {events.length !== 0 && (
        <>
          <Heading as="h2">{eventsTitle}</Heading>
          <SimpleGrid
            cols={4}
            spacing="lg"
            breakpoints={[
              { maxWidth: 'md', cols: 3, spacing: 'md' },
              { maxWidth: 'sm', cols: 2, spacing: 'sm' },
              { maxWidth: 'xs', cols: 1, spacing: 'sm' },
            ]}
          >
            {events &&
              events.map((event: EventDto) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card key={event.id} title={event.title!} description={event.description!} />
                </Link>
              ))}
          </SimpleGrid>
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
