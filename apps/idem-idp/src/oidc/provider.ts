import Provider from 'oidc-provider';
import { config } from '../config';
import { getKeyStore } from '../crypto/jwks';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc' });

export async function createOidcProvider(): Promise<Provider> {
  logger.info('Creating OIDC Provider');
  const jwks = await getKeyStore();

  const provider = new Provider(config.issuer, {
    jwks: { keys: jwks },

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
      required: (ctx, client) => client.requirePkce !== false,
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

    // Stub implementations (Phase 1)
    findAccount: async (ctx, sub) => ({
      accountId: sub,
      async claims() { return { sub }; },
    }),

    async findClient(clientId) {
      return null; // Implement in Phase 2
    },
  });

  logger.info({ issuer: config.issuer }, 'OIDC Provider created');
  return provider;
}
