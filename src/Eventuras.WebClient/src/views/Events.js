import React from 'react'
import { Box } from "@chakra-ui/react";
import { useGetEvents } from '../apis';
import EventsList from '../components/EventsList/EventsList';
import Layout from '../components/Layout';
import { config } from '../config'
import { useAuth0 } from '@auth0/auth0-react';

export default function Events() {
  // const opts = {
  //   audience: config.api.baseUrl,
  //   scope: 'read:events',
  // };
  const { login, getTokenWithPopup } = useAuth0();

  const { loading, error, refresh, data: events } = useGetEvents('/events')

  const getTokenAndTryAgain = async () => {
    await getTokenWithPopup(opts);
    refresh();
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    if (error.error === 'login_required') {
      return <button onClick={() => login(opts)}>Login</button>;
    }
    if (error.error === 'consent_required') {
      return (
        <button onClick={getTokenAndTryAgain}>Consent to reading users</button>
      );
    }
    return <div>Oops {error.message}</div>;
  }

  return (
    <Layout>
      <EventsList events={events} />
    </Layout>
  );
}
