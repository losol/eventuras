import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { eq } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc-clients' });

/**
 * Convert database client to oidc-provider format
 */
function toOidcClient(client: any) {
  const oidcClient: any = {
    client_id: client.clientId,
    client_name: client.clientName,
    redirect_uris: client.redirectUris,
    grant_types: client.grantTypes,
    response_types: client.responseTypes,

    // PKCE configuration
    token_endpoint_auth_method: client.clientType === 'confidential'
      ? 'client_secret_post'
      : 'none',
  };

  // Add optional metadata (only if not null)
  if (client.logoUri) oidcClient.logo_uri = client.logoUri;
  if (client.clientUri) oidcClient.client_uri = client.clientUri;
  if (client.policyUri) oidcClient.policy_uri = client.policyUri;
  if (client.tosUri) oidcClient.tos_uri = client.tosUri;
  if (client.contacts && Array.isArray(client.contacts)) {
    oidcClient.contacts = client.contacts;
  }

  return oidcClient;
}

/**
 * Load all active clients for oidc-provider initialization
 */
export async function loadAllClients() {
  logger.debug('Loading all active clients');

  const clients = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.active, true));

  logger.info({ count: clients.length }, 'Loaded active clients');

  return clients.map(toOidcClient);
}

/**
 * Find OAuth client by client ID
 * Returns oidc-provider compatible client object
 */
export async function findClient(clientId: string) {
  try {
    logger.debug({ clientId }, 'Looking up client');

    const [client] = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.clientId, clientId))
      .limit(1);

    if (!client || !client.active) {
      logger.warn({ clientId }, 'Client not found or inactive');
      return undefined;
    }

    logger.info({ clientId, clientName: client.clientName }, 'Client found');

    // Return oidc-provider compatible client object
    return {
      client_id: client.clientId,
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes,
      scope: client.allowedScopes.join(' '),

      // PKCE configuration
      require_pkce: client.requirePkce,

      // Token lifetimes
      access_token_ttl: client.accessTokenLifetime,
      refresh_token_ttl: client.refreshTokenLifetime,
      id_token_ttl: client.idTokenLifetime,

      // Authentication method
      token_endpoint_auth_method: client.clientType === 'confidential'
        ? 'client_secret_post'
        : 'none',

      // Client metadata
      logo_uri: client.logoUri,
      client_uri: client.clientUri,
      policy_uri: client.policyUri,
      tos_uri: client.tosUri,
      contacts: client.contacts,
    };
  } catch (error) {
    logger.error({ error, clientId }, 'Error looking up client');
    return undefined;
  }
}
