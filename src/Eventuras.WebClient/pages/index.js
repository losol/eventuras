import { Box, Heading, Skeleton, Stack } from "@chakra-ui/react";

import EventCard from "../components/event/EventCard/EventCard";
import Head from "next/head";
import Loading from "../components/common/Loading/Loading";
import NavBar from "../components/NavBar/NavBar";
import useRequest from "../lib/useRequest";

export default function Index() {
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
            Upcoming events...
          </Heading>
          {!events && <Loading />}
          {events &&
            events.map((e) => (
              <EventCard
                title={e.name}
                description={e.description}
                key={e.id}
              />
            ))}
          <Heading as="h1" marginTop="16" marginBottom="4">
            Online courses
          </Heading>
          {!onlinecourses && <Loading />}
          {onlinecourses &&
            onlinecourses.map((c) => (
              <EventCard
                title={c.name}
                description={c.description}
                key={c.id}
              />
            ))}
        </Box>
      </main>
    </>
  );
}
