import { ApiError, ApiError as SDKError, CancelablePromise, Eventuras } from '@eventuras/sdk';
import { publicEnv } from '@/config.client';

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

export const apiWrapper = <T>(fetchFunction: () => Promise<T> | CancelablePromise<T>) =>
  handleApiResponse(fetchFunction());

export const fetcher = <T>(fetchFunction: () => Promise<T>) => handleApiResponse(fetchFunction());

export const createSDK = ({ baseUrl, authHeader, inferUrl }: SDKOptions = {}): Eventuras => {
  // Use runtime environment variables directly so this module stays client-safe
  const orgId = process.env.NEXT_PUBLIC_ORGANIZATION_ID!;
  const apiVersion: string = (process.env.NEXT_PUBLIC_API_VERSION ?? '1') as string;
  let token: string | undefined | null;

  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }
  let apiBaseUrl: string = authHeader
    ? ((publicEnv.NEXT_PUBLIC_BACKEND_URL ?? '') as string)
    : ((publicEnv.NEXT_PUBLIC_API_BASE_URL ?? '') as string);
  if (baseUrl) {
    apiBaseUrl = baseUrl;
  } else if (inferUrl) {
    const requiresToken = (inferUrl as UrlInfer).requiresToken;
    // Treat NEXT_IN_PHASE_PRODUCTION_BUILD as truthy when set to 'true'
    const inPhaseProduction = String(process.env.NEXT_IN_PHASE_PRODUCTION_BUILD) === 'true';
    if (!requiresToken || inPhaseProduction) {
      //when we are building, the router is not available, use direct url instead, tokenless
      apiBaseUrl = (publicEnv.NEXT_PUBLIC_BACKEND_URL ?? '') as string;
    } else if (!token) {
      apiBaseUrl = (publicEnv.NEXT_PUBLIC_API_BASE_URL ?? '') as string;
    }
  }

  const headers: Headers = {
    'Eventuras-Org-Id': orgId.toString(),
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
