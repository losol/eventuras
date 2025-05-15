import {
  createClient as heyCreateClient,
  createConfig as heyCreateConfig,
} from '@hey-api/client-next';

import type { ClientOptions } from './client/types.gen';
import type { CreateClientConfig } from './client/client.gen';


export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: 'http://localhost:8080',
});

export const createClient = heyCreateClient;
export const createConfig = heyCreateConfig<ClientOptions>;
