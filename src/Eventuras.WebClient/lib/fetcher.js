export const fetcher = (url, token, fetchOptions) => {
  console.log(url,)
  console.log(token,)
  console.log(fetchOptions)
  fetch(url, {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    console.log(res)
    return res.json()
  }).catch(e => console.log(e));
}
