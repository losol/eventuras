import { Eventuras } from '@losol/eventuras';

import Environment from './Environment';

interface SDKOptions {
  baseUrl?: string;
  authToken?: string;
  authHeader?: string | null;
}

function createSDK({ baseUrl, authToken, authHeader }: SDKOptions = {}): Eventuras {
  const apiBaseUrl: string = baseUrl || Environment.API_BASE_URL;
  let token: string | undefined | null;

  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  } else if (authToken) {
    token = authToken;
  }

  const config: { BASE: string; TOKEN?: string } = { BASE: apiBaseUrl };
  if (token) {
    config.TOKEN = token;
  }

  return new Eventuras(config);
}

export default createSDK;
