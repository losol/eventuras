import ApiResult from './ApiResult';
import handler from './handler';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

const useFetch = (fetchFunction?: Fetcher) => {
  return fetchFunction ? fetchFunction : fetch;
};

const apiFetch = (
  url: RequestInfo | URL,
  init?: RequestInit | undefined,
  fetchFunction?: Fetcher
) => apiWrapper(() => useFetch(fetchFunction)(url, init));

export const apiWrapper = (fetchFunction: () => Promise<Response>) =>
  fetchFunction()
    .then(handler)
    .then(res => ApiResult.success(res))
    .catch(err => {
      return ApiResult.error(err);
    });

export default apiFetch;
