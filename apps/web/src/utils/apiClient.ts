import { createConfig, createClient as heyCreateClient } from '@hey-api/client-next';
import type { ClientOptions } from '@eventuras/event-sdk/types.gen';
import { getAccessToken } from './getAccesstoken';

export async function getApiConfig() {
  const headers: Record<string, string> = {};

  // add auth header only to server-side requests
  if (typeof window === 'undefined') {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APPLICATION_URL}/api/session`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const session = await res.json();
    const token = await getAccessToken();
    if (session && token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return createConfig<ClientOptions>({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL!,
    headers,
  });
}

let cachedClient: ReturnType<typeof import('@hey-api/client-next').createClient> | null = null;

export const createClient = async () => {
  if (cachedClient) return cachedClient;

  const config = await getApiConfig();
  cachedClient = heyCreateClient(config);
  return cachedClient;
};
