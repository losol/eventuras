type StatusMap = {
  [status: number]: (response: Response) => Promise<any | string>;
};

const statusMapper = {
  200: (response: Response) => {
    return response.json();
  },
  204: (response: Response) => {
    return response.text();
  },
  400: (response: Response) => {
    throw new Error('Api Request Issue', {
      cause: { statusCode: response.status, statusText: response.statusText },
    });
  },
  500: (response: Response) => {
    throw new Error('Server broken', {
      cause: { statusCode: response.status, statusText: response.statusText },
    });
  },
} as StatusMap;

const apiResponseHandler = (response: Response): Promise<any | string> => {
  const func = statusMapper[response.status];
  switch (true) {
    case func !== null && typeof func === 'function':
      return func(response);
    case response.status > 200 && response.status < 300:
      return statusMapper[204](response);
    case response.status >= 400 && response.status < 500:
      return statusMapper[400](response);
    case response.status >= 500:
      return statusMapper[500](response);
    default:
      throw new Error('Unable to handle API response');
  }
};

export default apiResponseHandler;
