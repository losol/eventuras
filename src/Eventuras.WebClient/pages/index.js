import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import Head from 'next/head';

import { Layout, Loading } from '../components/common';
import EventCard from '../components/event/EventCard/EventCard';

export default function Index(props) {
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
            {!props.events && <Loading />}
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="20px">
              {props.events &&
                props.events.map((item) => (
                  <EventCard
                    id={item.id}
                    title={item.name}
                    description={item.description}
                    key={item.id}
                  />
                ))}
            </SimpleGrid>
            <Heading as="h2" marginTop="16" marginBottom="4">
              Nettkurs
            </Heading>
            {!props.onlinecourses && <Loading />}
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="20px">
              {props.onlinecourses &&
                props.onlinecourses.map((item) => (
                  <EventCard
                    id={item.id}
                    title={item.name}
                    description={item.description}
                    key={item.id}
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
      events,
      onlinecourses,
    },
    revalidate: 1, // In seconds
  };
}
