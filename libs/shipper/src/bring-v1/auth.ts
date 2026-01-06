import { clientCredentialsGrant } from '@eventuras/fides-auth/oauth';
import { ShippingAuthError } from '../core/types';
import type { BringConfig, BringTokenResponse } from './types';

/**
 * Fetches an OAuth access token using client credentials flow
 *
 * @param config - Bring API configuration
 * @returns Access token response
 * @throws {ShippingAuthError} If authentication fails
 */
export async function fetchAccessToken(config: BringConfig): Promise<BringTokenResponse> {
  try {
    const tokens = await clientCredentialsGrant({
      tokenEndpoint: `${config.apiUrl}/oauth2/token`,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return {
      access_token: tokens.access_token,
      token_type: tokens.token_type ?? 'Bearer',
      expires_in: tokens.expires_in ?? 3600,
      scope: tokens.scope ?? '',
    };
  } catch (error) {
    throw new ShippingAuthError(
      `Failed to fetch Bring access token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error }
    );
  }
}
