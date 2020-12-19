import { Box, Heading } from "@chakra-ui/react";

import EventCard from "../components/EventCard/EventCard";
import Head from "next/head";
import NavBar from "../components/NavBar/NavBar";

export default function Index() {
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
          <EventCard />
        </Box>
      </main>
    </>
  );
}
