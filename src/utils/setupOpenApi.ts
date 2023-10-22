import { OpenAPI } from '@losol/eventuras';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

/**
 * Sets up the OpenAPI configuration.
 *
 * @param {string | null} authorizationToken - The authorization token to be used for API requests.
 * Use "headers().get('Authorization')" to get bearer from headers.
 */
export const setupOpenAPI = (authorizationToken: string | null) => {
  OpenAPI.BASE = Environment.get(EnvironmentVariables.API_BASE_URL);
  OpenAPI.TOKEN = authorizationToken?.substring(7) ?? '';
};
