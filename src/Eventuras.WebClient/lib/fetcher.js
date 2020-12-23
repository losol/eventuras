export const fetcher = (url, token, fetchOptions) =>
  fetch(url, {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
