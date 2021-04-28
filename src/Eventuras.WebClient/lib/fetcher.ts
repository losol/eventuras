const get = (url, options = null) => {
  const requestOptions = {
    method: 'GET',
    headers: getHeaders(options),
  };

  return fetch(addBaseUrl(url), requestOptions).then(handleResponse);
};

const post = (url, body, options = null) => {
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(options),
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions).then(handleResponse);
};

const put = (url, body, options = null) => {
  const requestOptions = {
    method: 'PUT',
    headers: getHeaders(options),
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions).then(handleResponse);
};

const deleter = (url, options) => {
  const requestOptions = {
    method: 'DELETE',
    headers: getHeaders(options),
  };
  return fetch(url, requestOptions).then(handleResponse);
};

const handleResponse = async (response) => {
  const json = await response.json();

  if (response.ok) {
    return json;
  } else {
    const error = new Error(response.status + ': ' + response.statusText);
    return Promise.reject(error);
  }
};

const addBaseUrl = (url): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL + url;
};

const getHeaders = (options) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (options?.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }

  return headers;
};

export const fetcher = {
  get,
  post,
  put,
  delete: deleter,
};
