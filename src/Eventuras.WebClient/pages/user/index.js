import { Container, Heading } from "@chakra-ui/react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

import { Layout } from "../../components/common";
import React from "react";
import useApi from "../../lib/useApi";

function UserIndex() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const { data: registrations } = useApi("/v3/userprofile/registrations");

  return (
    <Layout>
      <Container marginTop="16">
        <Heading>Heihei {user.name} </Heading>

        {registrations && registrations.map((r) => <p>{r.registrationId}</p>)}
      </Container>
    </Layout>
  );
}

export default withAuthenticationRequired(UserIndex);
