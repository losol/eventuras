import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { eq } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';
import { decrypt } from '../crypto/encrypt';

const logger = Logger.create({ namespace: 'idem:oidc-clients' });

/**
 * Convert a database client row to oidc-provider format.
 * Decrypts client_secret for confidential clients.
 */
async function toOidcClient(client: typeof oauthClients.$inferSelect) {
  const oidcClient: Record<string, unknown> = {
    client_id: client.clientId,
    client_name: client.clientName,
    redirect_uris: client.redirectUris,
    grant_types: client.grantTypes,
    response_types: client.responseTypes,
    scope: client.allowedScopes.join(' '),
    require_pkce: client.requirePkce,
    token_endpoint_auth_method: client.clientType === 'confidential'
      ? 'client_secret_post'
      : 'none',
    'urn:idem:client_category': client.clientCategory,
  };

  if (client.clientSecretEncrypted) {
    oidcClient.client_secret = await decrypt(client.clientSecretEncrypted);
  }

  return oidcClient;
}

/**
 * Find OAuth client by client_id.
 * Returns oidc-provider compatible client object.
 * Used by the adapter for dynamic client lookup.
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
      logger.debug({ clientId }, 'Client not found or inactive');
      return undefined;
    }

    const oidcClient = await toOidcClient(client);
    logger.debug({ clientId, clientName: client.clientName }, 'Client found');
    return oidcClient;
  } catch (error) {
    logger.error({ error, clientId }, 'Error looking up client');
    return undefined;
  }
}
