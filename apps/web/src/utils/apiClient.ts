import { createClient as heyCreateClient } from '@eventuras/event-sdk';
import { getAccessToken } from './getAccesstoken';

export const createClient = async () => {
  const headers: Record<string, string> = {};

  if (typeof window === 'undefined') {
    const token = await getAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return heyCreateClient({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL!,
    headers
  });
};
