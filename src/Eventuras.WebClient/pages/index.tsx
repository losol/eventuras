import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { EventCard, Layout, Loading } from 'components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import { EventType, LocalesType, OnlineCourseType } from 'types';

type IndexProps = {
  events: EventType[];
  onlinecourses: OnlineCourseType[];
  locales: LocalesType;
};

export default function Index(props: IndexProps) {
  const { events, onlinecourses, locales } = props;
  const { demoTitleLocale, demoTextLocale } = locales.component;
  const { eventsTitle, onlineCoursesTitle } = locales.common;
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>Eventuras</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <main>
          <Box margin="8">
            <Heading as="h2" marginTop="16" marginBottom="4">
              {demoTitleLocale} {locale?.toUpperCase()}
            </Heading>
            <Text>{demoTextLocale}</Text>
          </Box>

          <Box margin="8">
            <Heading as="h2" marginTop="16" marginBottom="4">
              {eventsTitle}
            </Heading>
            {!events && <Loading />}
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="20px">
              {events &&
                events.map((item: EventType) => (
                  <EventCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    href={`/event/${item.id}`}
                  />
                ))}
            </SimpleGrid>
            <Heading as="h2" marginTop="16" marginBottom="4">
              {onlineCoursesTitle}
            </Heading>
            {!onlinecourses && <Loading />}
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="20px">
              {onlinecourses &&
                onlinecourses.map((onlineCourse: OnlineCourseType) => (
                  <EventCard
                    key={onlineCourse.id}
                    title={onlineCourse.name}
                    description={onlineCourse.description}
                    href={`/onlinecourse/${onlineCourse.id}`}
                  />
                ))}
            </SimpleGrid>
          </Box>
        </main>
      </Layout>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  // Data
  const eventsResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/events'
  );
  const events = await eventsResponse.json();

  const onlinecoursesResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/onlinecourses'
  );
  const onlinecourses = await onlinecoursesResponse.json();

  // Locales
  const translateComponent = await getT(locale, 'index');
  const demoTitleLocale = translateComponent('demoTitle');
  const demoTextLocale = translateComponent('demoText');

  const translateCommon = await getT(locale, 'common');
  const eventsTitle = translateCommon('events');
  const onlineCoursesTitle = translateCommon('onlinecourses');

  return {
    props: {
      events: events.data,
      onlinecourses,
      locales: {
        component: {
          demoTitleLocale,
          demoTextLocale,
        },
        common: {
          eventsTitle,
          onlineCoursesTitle,
        },
      },
    },
    revalidate: 1, // In seconds
  };
}
