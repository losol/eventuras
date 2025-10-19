import { createClient as heyCreateClient } from '@eventuras/event-sdk/client-next';
import { getAccessToken } from './getAccesstoken';

export const createClient = async () => {
  const headers: Record<string, string> = {};

  if (typeof window === 'undefined') {
    const [sessionRes, token] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APPLICATION_URL}/api/session`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      }),
      getAccessToken(),
    ]);

    const session = await sessionRes.json();
    if (session && token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return heyCreateClient({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL!,
    headers,
  });
};
