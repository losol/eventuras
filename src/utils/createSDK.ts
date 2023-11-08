import { Eventuras } from '@losol/eventuras';

import Environment from './Environment';

type Headers = Record<string, string>;

interface SDKOptions {
  baseUrl?: string;
  authToken?: string;
  authHeader?: string | null;
}

function createSDK({ baseUrl, authToken, authHeader }: SDKOptions = {}): Eventuras {
  const apiBaseUrl: string = baseUrl || Environment.NEXT_PUBLIC_BACKEND_URL;
  const orgId: string = Environment.NEXT_PUBLIC_ORGANIZATION_ID;
  const apiVersion = Environment.NEXT_PUBLIC_API_VERSION;
  let token: string | undefined | null;

  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  } else if (authToken) {
    token = authToken;
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
}

export default createSDK;
