import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

import { Layout } from "../../components/common";
import React from "react";

function Index() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

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
      </Layout>
    );
  } else {
    return <button onClick={loginWithRedirect}>Log in</button>;
  }
}

export default withAuthenticationRequired(Index);
