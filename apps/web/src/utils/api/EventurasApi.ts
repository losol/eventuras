import { ApiError, ApiError as SDKError, CancelablePromise, Eventuras } from '@losol/eventuras';

import Environment from '../Environment';
type Headers = Record<string, string>;

type UrlInfer = {
  enabled: boolean;
  requiresToken?: boolean | null;
};
interface SDKOptions {
  baseUrl?: string;
  authHeader?: string | null;
  inferUrl?: UrlInfer | boolean | null;
}

export type ApiState = {
  error: ApiError | null;
  loading: boolean;
};

export class ApiResult<T = void, E = ApiError> {
  private _isSuccess: boolean;
  private okResult: T | null;
  private errorResult: E | null;

  constructor(isSuccess: boolean, _okResult: T | null, _errResult: E | null) {
    this._isSuccess = isSuccess;
    this.okResult = _okResult;
    this.errorResult = _errResult;
  }

  public get ok(): boolean {
    return this._isSuccess;
  }

  get value(): T | null {
    return this.okResult!;
  }

  get error(): E | null {
    return this.errorResult!;
  }
}

function handleApiResponse<T>(promise: Promise<T>): Promise<ApiResult<T, ApiError>> {
  return promise
    .then(body => new ApiResult<T, ApiError>(true, body, null))
    .catch((err: SDKError) => {
      if (err.status >= 500) {
        throw err;
      }
      return new ApiResult<T, ApiError>(false, null, err);
    });
}

export const apiWrapper = <T>(fetchFunction: () => CancelablePromise<T>) =>
  handleApiResponse(fetchFunction());

export const fetcher = <T>(fetchFunction: () => Promise<T>) => handleApiResponse(fetchFunction());

export const createSDK = ({ baseUrl, authHeader, inferUrl }: SDKOptions = {}): Eventuras => {
  const orgId: string = Environment.NEXT_PUBLIC_ORGANIZATION_ID;
  const apiVersion = Environment.NEXT_PUBLIC_API_VERSION;
  let token: string | undefined | null;

  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }
  let apiBaseUrl: string = authHeader
    ? Environment.NEXT_PUBLIC_BACKEND_URL
    : Environment.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    apiBaseUrl = baseUrl;
  } else if (inferUrl) {
    const requiresToken = (inferUrl as UrlInfer).requiresToken;
    if (!requiresToken || Environment.NEXT_IN_PHASE_PRODUCTION_BUILD) {
      //when we are building, the router is not available, use direct url instead, tokenless
      apiBaseUrl = Environment.NEXT_PUBLIC_BACKEND_URL;
    } else if (!token) {
      apiBaseUrl = Environment.NEXT_PUBLIC_API_BASE_URL;
    }
  }

  const headers: Headers = {
    'Eventuras-Org-Id': orgId,
  };

  const config: {
    BASE: string;
    TOKEN?: string;
    HEADERS?: Headers | undefined;
    VERSION: string;
  } = {
    BASE: apiBaseUrl,
    TOKEN: token ?? undefined,
    HEADERS: headers,
    VERSION: apiVersion,
  };
  if (token) {
    config.TOKEN = token;
  }

  return new Eventuras(config);
};
