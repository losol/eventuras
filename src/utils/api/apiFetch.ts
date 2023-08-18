import ApiResult from './ApiResult';
import handler from './handler';

const apiFetch = (url: string, init?: RequestInit) =>
  fetch(url, init)
    .then(handler)
    .then(res => ApiResult.success(res))
    .catch(err => {
      return ApiResult.error(err);
    });

export default apiFetch;
