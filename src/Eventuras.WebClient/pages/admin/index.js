import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

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

  const { data: registrations } = useApi("/v1/registrations");

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <Layout>
        Hello {user.name}{" "}
        <button onClick={() => logout({ returnTo: window.location.origin })}>
          Log out
        </button>
        {registrations && registrations.map((r) => <p>r.registrationId</p>)}
      </Layout>
    );
  } else {
    return <button onClick={loginWithRedirect}>Log in</button>;
  }
}

export default withAuthenticationRequired(AdminIndex);
