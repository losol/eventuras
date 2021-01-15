import { Box, Heading, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";
import { Layout, Loading } from "../components/common";

import EventCard from "../components/event/EventCard/EventCard";
import Head from "next/head";
import useRequest from "../lib/useRequest";

export default function Index() {
  const { data: events } = useRequest("/v3/events");
  const { data: onlinecourses } = useRequest("/v3/onlinecourses");

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
                events.map((e) => (
                  <EventCard
                    id={e.id}
                    title={e.name}
                    description={e.description}
                    key={e.id}
                  />
                ))}
            </SimpleGrid>
            <Heading as="h2" marginTop="16" marginBottom="4">
              Nettkurs
            </Heading>
            {!onlinecourses && <Loading />}

            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="20px">
              {onlinecourses &&
                onlinecourses.map((c) => (
                  <EventCard
                    id={c.id}
                    title={c.name}
                    description={c.description}
                    key={c.id}
                  />
                ))}
            </SimpleGrid>
          </Box>
        </main>
      </Layout>
    </>
  );
}
