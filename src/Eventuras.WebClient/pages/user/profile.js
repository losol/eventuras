import React from "react";
import { Container, Heading, Text } from "@chakra-ui/react";
import { Layout } from "../../components/common";
import useApi from "../../lib/useApi";
import {useSession} from 'next-auth/client';

function UserProfile() {
  const [session, loading] = useSession();

  const { data: registrations } = useApi("/v3/registrations");

  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Min bruker</Heading>
        {!registrations && <loader/>}
        <Text>Navn: {session && session.user.name}</Text>
        <Text>E-post: {session && session.user.email}</Text>
      </Container>
    </Layout>
  );
}

export default UserProfile;
