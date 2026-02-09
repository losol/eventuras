import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { eq } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';
import { decrypt } from '../crypto/encrypt';

const logger = Logger.create({ namespace: 'idem:oidc-clients' });

/**
 * Convert database client to oidc-provider format.
 * Decrypts client_secret for confidential clients.
 */
function toOidcClient(client: typeof oauthClients.$inferSelect) {
  const oidcClient: Record<string, unknown> = {
    client_id: client.clientId,
    client_name: client.clientName,
    redirect_uris: client.redirectUris,
    grant_types: client.grantTypes,
    response_types: client.responseTypes,
    token_endpoint_auth_method: client.clientType === 'confidential'
      ? 'client_secret_post'
      : 'none',
    'urn:idem:client_category': client.clientCategory,
  };

  if (client.clientSecretEncrypted) {
    oidcClient.client_secret = decrypt(client.clientSecretEncrypted);
  }

  return oidcClient;
}

/**
 * Load all active clients for oidc-provider initialization
 */
export async function loadAllClients() {
  logger.debug('Loading all active clients');

  const dbClients = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.active, true));

  const clients = dbClients.map(toOidcClient);

  logger.info({ count: clients.length }, 'Loaded active clients');

  return clients;
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

    const oidcClient: Record<string, unknown> = {
      client_id: client.clientId,
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes,
      scope: client.allowedScopes.join(' '),
      require_pkce: client.requirePkce,
      access_token_ttl: client.accessTokenLifetime,
      refresh_token_ttl: client.refreshTokenLifetime,
      id_token_ttl: client.idTokenLifetime,
      token_endpoint_auth_method: client.clientType === 'confidential'
        ? 'client_secret_post'
        : 'none',
      'urn:idem:client_category': client.clientCategory,
    };

    if (client.clientSecretEncrypted) {
      oidcClient.client_secret = decrypt(client.clientSecretEncrypted);
    }

    return oidcClient;
  } catch (error) {
    logger.error({ error, clientId }, 'Error looking up client');
    return undefined;
  }
}
