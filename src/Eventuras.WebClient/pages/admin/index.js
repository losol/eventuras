import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Container, Heading } from "@chakra-ui/react";
import { Layout } from "../../components/common";
import React from "react";
import useApi from "../../lib/useApi";

function AdminIndex() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const { data: registrations } = useApi("/v3/registrations");

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
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
    return <button onClick={loginWithRedirect}>Log in</button>;
  }
}

export default withAuthenticationRequired(AdminIndex);
