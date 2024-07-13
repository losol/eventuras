import { type Client,createClient } from "@hey-api/client-fetch";

import Environment from "../Environment";

type UrlInfer = {
  enabled: boolean;
  requiresToken?: boolean | null;
};
interface ClientOptions {
  baseUrl?: string;
  authHeader?: string | null;
  inferUrl?: UrlInfer | boolean | null;
}
export const createEventurasClient = ({ baseUrl, authHeader, inferUrl }: ClientOptions = {}): Client => {
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

  
  return createClient({
    // set default base url for requests
    baseUrl: apiBaseUrl,
    // set default headers for requests
    headers: {
      Authorization: token,
      'Eventuras-Org-Id': orgId
    },
  });
}
