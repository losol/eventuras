import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Container, Heading, Text } from "@chakra-ui/react";

import { Layout } from "../../components/common";
import React from "react";
import useApi from "../../lib/useApi";

function UserProfile() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const { data: registrations } = useApi("/v3/registrations");

  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Min bruker</Heading>
        <Text>Navn: {user.name}</Text>
        {registrations && registrations.map((r) => <p>r.registrationId</p>)}
      </Container>
    </Layout>
  );

}

export default withAuthenticationRequired(UserProfile);
