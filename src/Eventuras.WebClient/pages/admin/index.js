import { Box, Heading } from "@chakra-ui/react";

import EventCard from "../../components/event/EventCard/EventCard";
import Head from "next/head";
import NavBar from "../../components/NavBar/NavBar";
import useRequest from "../../lib/useRequest";

function Index() {
  const { data: events } = useRequest("/events");
  const { data: onlinecourses } = useRequest("/onlinecourses");

  return (
    <>
      <Head>
        <title>Eventuras</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main>
        <Box margin="8">
          <Heading as="h1" marginTop="16" marginBottom="4">
            Admin page
          </Heading>
          {events &&
            events.map((e) => (
              <EventCard
                title={e.name}
                description={e.description}
                key={e.id}
              />
            ))}
        </Box>
      </main>
    </>
  );
}

export default Index;
