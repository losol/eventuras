import Provider from 'oidc-provider';
import { config } from '../config';
import { getKeyStore } from '../crypto/jwks';
import { adapterFactory } from './adapter';
import { loadAllClients } from './clients';
import { findAccount } from './accounts';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc' });

export async function createOidcProvider(): Promise<any> {
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
      devInteractions: { enabled: false }, // Disabled - using custom interaction routes
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
      short: { signed: true, httpOnly: true, sameSite: 'lax', secure: config.features.requireHttps },
      long: { signed: true, httpOnly: true, sameSite: 'lax', secure: config.features.requireHttps },
    },

    // Account lookup
    findAccount,

    // Interaction URL
    interactions: {
      url(_ctx: any, interaction: any) {
        return `/interaction/${interaction.uid}`;
      },
    },

    // Skip consent in development/testing (auto-approve all prompts except login)
    async loadExistingGrant(ctx: any) {
      const grantId = (ctx.oidc.result
        && ctx.oidc.result.consent
        && ctx.oidc.result.consent.grantId) || ctx.oidc.session?.grantIdFor(ctx.oidc.client.clientId);

      if (grantId) {
        return ctx.oidc.provider.Grant.find(grantId);
      } else {
        // Auto-grant in development (skip consent prompt)
        if (config.nodeEnv === 'development') {
          const grant = new ctx.oidc.provider.Grant({
            clientId: ctx.oidc.client.clientId,
            accountId: ctx.oidc.session.accountId,
          });

          // Add the exact scopes from the authorization request
          const scopes = ctx.oidc.params.scope.split(' ').filter(Boolean);
          grant.addOIDCScope(scopes.filter((scope: string) => ['openid', 'profile', 'email', 'offline_access'].includes(scope)).join(' '));

          // Add any requested claims
          grant.addOIDCClaims(['sub']);
          if (scopes.includes('profile')) {
            grant.addOIDCClaims(['name', 'given_name', 'family_name', 'picture', 'locale']);
          }
          if (scopes.includes('email')) {
            grant.addOIDCClaims(['email', 'email_verified']);
          }

          await grant.save();
          return grant;
        }
      }
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

      // Only include stack traces in development mode
      const errorDetails = config.nodeEnv === 'development'
        ? `<pre>${error?.message || 'An error occurred'}</pre>
           <pre>${error?.stack || ''}</pre>`
        : `<p>${error?.message || 'An error occurred'}</p>
           <p>Please contact support if the problem persists.</p>`;

      ctx.body = `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
  <h1>Error</h1>
  ${errorDetails}
</body>
</html>`;
    },
  });

  logger.info({ issuer: config.issuer }, 'OIDC Provider created');
  return provider;
}
