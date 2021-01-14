import { useEffect, useState } from "react";

import { fetcher } from "./fetcher";
import { useAuth0 } from "@auth0/auth0-react";
import useSWR from "swr";

export const useApi = (url, options = {}) => {
  const { audience, scope, ...fetchOptions } = options;
  const { getAccessTokenSilently } = useAuth0();
  const [state, setState] = useState({
    error: null,
    loading: true,
    data: null,
  });
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [token, setToken] = useState("");

  const { data, error } = useSWR(
    token ? process.env.NEXT_PUBLIC_API_BASE_URL + url : null,
    (url) => fetcher(url, token, fetchOptions),
    {
      refreshInterval: 0,
    }
  );

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently({ audience: "https://eventuras/api", scope: "openid profile email registrations:read" });
        setToken(token);
        setState({
          ...state,
          error,
          loading: false,
        });
      } catch (tokenError) {
        setState({
          ...state,
          error: tokenError,
          loading: false,
        });
        setToken("");
      }
    })();
  }, [refreshIndex]);

  useEffect(() => {
    setState({
      ...state,
      data,
      error,
      loading: error ? true : state.loading,
    });
  }, [data, error]);

  return {
    ...state,
    refresh: () => setRefreshIndex(refreshIndex + 1),
  };
};

export default useApi;
