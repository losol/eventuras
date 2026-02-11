'use server';

import { Logger } from '@eventuras/logger';

import { config } from '@/utils/config';
import { getAccessToken } from '@/utils/getAccessToken';

const logger = Logger.create({ namespace: 'idem-admin:clients:actions' });

export type OAuthClient = {
  id: string;
  clientId: string;
  clientName: string;
  clientUri?: string;
  clientType: 'confidential' | 'public';
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  allowedScopes: string[];
  requirePkce: boolean;
  active: boolean;
  createdAt: string;
};

export type GetClientsResult = {
  success: boolean;
  clients?: OAuthClient[];
  error?: string;
};

export async function getClients(): Promise<GetClientsResult> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      logger.warn('No access token available');
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${config.idemIdpUrl}/api/admin/clients`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, error: errorText }, 'Failed to fetch clients');
      return { success: false, error: `Failed to fetch clients: ${response.status}` };
    }

    const data = await response.json();
    logger.info({ count: data.clients?.length }, 'Fetched clients');

    return { success: true, clients: data.clients };
  } catch (error) {
    logger.error({ error }, 'Error fetching clients');
    return { success: false, error: 'Failed to fetch clients' };
  }
}
