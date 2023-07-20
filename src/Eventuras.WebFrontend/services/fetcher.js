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
  return fetch(addBaseUrl(url), requestOptions).then(handleResponse);
};

const put = (url, body, options = null) => {
  const requestOptions = {
    method: 'PUT',
    headers: getHeaders(options),
    body: JSON.stringify(body),
  };
  return fetch(addBaseUrl(url), requestOptions).then(handleResponse);
};

const deleter = (url, options) => {
  const requestOptions = {
    method: 'DELETE',
    headers: getHeaders(options),
  };
  return fetch(addBaseUrl(url), requestOptions).then(handleResponse);
};

const handleResponse = async (response) => {
  if (response.ok) {
    return response.json();
  } else {
    const text = await response.text();
    const error = response.status + ' ' + response.statusText + ': ' + text;
    return Promise.reject(error);
  }
};

const addBaseUrl = url => {
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
