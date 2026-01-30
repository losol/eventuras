import Provider from 'oidc-provider';
import { config } from '../config';
import { getKeyStore } from '../crypto/jwks';
import { adapterFactory } from './adapter';
import { loadAllClients } from './clients';
import { findAccount } from './accounts';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc' });

export async function createOidcProvider(): Promise<Provider> {
  logger.info('Creating OIDC Provider');
  const jwks = await getKeyStore();

  // Load clients from database for oidc-provider v9
  const clients = await loadAllClients();
  logger.info({ clientCount: clients.length }, 'Loaded clients for provider');

  const provider = new Provider(config.issuer, {
    adapter: adapterFactory,
    jwks: { keys: jwks },

    // Pre-configured clients (oidc-provider v9 requires this)
    clients,

    routes: {
      userinfo: '/userinfo',
      jwks: '/.well-known/jwks.json',
    },

    features: {
      devInteractions: { enabled: config.features.devShortcuts },
      pushedAuthorizationRequests: { enabled: true }, // PAR (RFC 9126)
      rpInitiatedLogout: { enabled: true },
    },

    pkce: {
      required: (_ctx: any, client: any) => {
        // Check if client requires PKCE (default: true for public clients)
        return client.token_endpoint_auth_method === 'none';
      },
    },

    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
    scopes: ['openid', 'profile', 'email', 'offline_access'],

    claims: {
      openid: ['sub'],
      profile: ['name', 'given_name', 'family_name', 'middle_name', 'picture', 'locale'],
      email: ['email', 'email_verified'],
    },

    ttl: {
      AccessToken: 3600,        // 1 hour
      AuthorizationCode: 600,   // 10 minutes
      IdToken: 3600,            // 1 hour
      RefreshToken: 2592000,    // 30 days
      Grant: 2592000,           // 30 days
    },

    cookies: {
      keys: [config.sessionSecret],
      short: { signed: true, httpOnly: true, sameSite: 'lax' },
      long: { signed: true, httpOnly: true, sameSite: 'lax' },
    },

    // Account lookup
    findAccount,

    // Interaction URL
    interactions: {
      url(_ctx: any, interaction: any) {
        return `/interaction/${interaction.uid}`;
      },
    },

    // Error rendering (log errors for debugging)
    async renderError(ctx: any, out: any, error: any) {
      logger.error({
        error: error?.message || error,
        details: error,
        status: ctx.status,
        path: ctx.path,
      }, 'OIDC provider error');

      // Default error rendering
      ctx.type = 'html';
      ctx.body = `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
  <h1>Error</h1>
  <pre>${error?.message || 'An error occurred'}</pre>
  <pre>${error?.stack || ''}</pre>
</body>
</html>`;
    },
  });

  logger.info({ issuer: config.issuer }, 'OIDC Provider created');
  return provider;
}
