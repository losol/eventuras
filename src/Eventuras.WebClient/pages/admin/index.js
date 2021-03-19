import React from "react";
import { signIn, useSession } from 'next-auth/client'
import { Container, Heading } from "@chakra-ui/react";

import { Layout } from "../../components/common";
import useApi from "../../lib/useApi";

function AdminIndex() {
  const [
    session,
    loading,
    error
  ] = useSession();

  const { data: registrations } = useApi("/v3/registrations");
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (session) {
    return (
      <Layout>
        <Container paddingTop="32">
          <Heading as="h1">Admin</Heading>
          <Heading as="h2" paddingTop="16">Siste registreringer</Heading>
          {registrations && registrations.map((r) => <p>{r.registrationId}, {r.userId}</p>)}
        </Container>
      </Layout>
    );
  } else {
    return <button onClick={() => signIn()}>Log in</button>;
  }
}

export default AdminIndex;
