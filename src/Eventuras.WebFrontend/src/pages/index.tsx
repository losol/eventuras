import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { EventCard, Layout, Loading } from 'components';
import Head from 'next/head';
import { EventType, OnlineCourseType } from 'types';

type IndexProps = {
  events: EventType[];
  onlinecourses: OnlineCourseType[];
};

export default function Index(props: IndexProps) {
  const { events, onlinecourses } = props;

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
              Arrangementer
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
              Nettkurs
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

export async function getStaticProps() {
  const eventsResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/events'
  );
  const events = await eventsResponse.json();

  const onlinecoursesResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/onlinecourses'
  );
  const onlinecourses = await onlinecoursesResponse.json();

  return {
    props: {
      events: events.data,
      onlinecourses,
    },
    revalidate: 1, // In seconds
  };
}
