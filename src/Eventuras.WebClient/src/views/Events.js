import React from 'react'
import { Box } from "@chakra-ui/react";
import { useGetEvents } from '../apis';
import EventsList from '../components/EventsList/EventsList';
import Layout from '../components/Layout';

export default function Events() {
  const { events, error } = useGetEvents('/events')

  if (error) return "An error has occurred.";
  if (!events) return "Loading...";
  return (
    <Layout>
      <EventsList events={events} />
    </Layout>
  );
}
