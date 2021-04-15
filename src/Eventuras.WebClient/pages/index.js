import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { Layout, Loading } from '../components/common';

import EventCard from '../components/event/EventCard/EventCard';
import Head from 'next/head';
import useSWR from "swr";

export default function Index(props) {
  const { data: events } = useSWR('/api/getEvents');
  const { data: user } = useSWR('/api/getUser');
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
                events.map((item) => (
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
  const onlinecoursesResponse = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + '/v3/onlinecourses'
  );
  const onlinecourses = await onlinecoursesResponse.json();

  return {
    props: {
      onlinecourses,
    },
    revalidate: 1, // In seconds
  };
}
