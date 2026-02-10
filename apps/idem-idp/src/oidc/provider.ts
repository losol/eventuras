import Provider from 'oidc-provider';
import { config } from '../config';
import { getKeyStore } from '../crypto/jwks';
import { adapterFactory } from './adapter';
import { findAccount } from './accounts';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc' });

export async function createOidcProvider(): Promise<any> {
  logger.info('Creating OIDC Provider');
  const jwks = await getKeyStore();

  const provider = new Provider(config.issuer, {
    adapter: adapterFactory,
    jwks: { keys: jwks },

    // Trust proxy headers (CRITICAL when behind Cloudflare Tunnel or reverse proxy)
    // This ensures redirects use HTTPS even when receiving HTTP requests
    proxy: true,

    // NOTE: PKCE parameters (code_challenge, code_challenge_method) are handled natively
    // by oidc-provider and should NOT be in extraParams

    routes: {
      userinfo: '/userinfo',
      jwks: '/.well-known/jwks.json',
    },

    features: {
      devInteractions: { enabled: false }, // Disabled - using custom interaction routes
      pushedAuthorizationRequests: { enabled: true }, // PAR (RFC 9126)
      rpInitiatedLogout: { enabled: true },

      // Resource Indicators (RFC 8707) — required for JWT access tokens in v9
      resourceIndicators: {
        enabled: true,

        // Default resource when client doesn't specify one
        defaultResource(_ctx: any) {
          return config.issuer;
        },

        // Validate and return resource server info
        getResourceServerInfo(_ctx: any, resourceIndicator: string) {
          // Accept the issuer as a valid resource
          if (resourceIndicator === config.issuer) {
            return {
              scope: 'openid profile email offline_access',
              audience: config.issuer,
              accessTokenFormat: 'jwt',
              jwt: { sign: { alg: 'PS256' } },
            };
          }

          // Reject unknown resources
          throw new Error('Invalid resource');
        },

        useGrantedResource(_ctx: any) {
          return true;
        },
      },
    },

    // Include profile/email claims in ID token (not just userinfo endpoint)
    // This is needed for SPAs that rely on ID token claims for authorization
    conformIdTokenClaims: false,

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
      // ADR 0018: 'roles' replaces 'system_role' - per-client role array
      profile: ['name', 'given_name', 'family_name', 'middle_name', 'picture', 'locale', 'roles'],
      email: ['email', 'email_verified'],
    },

    ttl: {
      AccessToken: 600,           // 10 minutes
      AuthorizationCode: 60,      // 60 seconds (RFC 6749: single-use, immediate)
      IdToken: 600,               // 10 minutes
      RefreshToken: 1209600,      // 14 days (with rotation)
      Grant: 31536000,            // 1 year (consent duration)
      Interaction: 900,           // 15 minutes (login flow timeout)
      Session: 86400,             // 24 hours (browser session)
    },

    cookies: {
      keys: [config.sessionSecret],
      // secure: undefined allows oidc-provider to auto-detect based on request protocol
      // This works with both http://localhost:3200 and https://idem-dev.example.com
      // IMPORTANT: Set path to '/' so cookies are sent on ALL routes, enabling
      // the clear-session endpoint to receive and clear them
      short: { signed: true, httpOnly: true, sameSite: 'lax', path: '/' },
      long: { signed: true, httpOnly: true, sameSite: 'lax', path: '/' },
    },

    // Account lookup
    findAccount,

    // Interaction URL (must stay on same origin for cookies)
    interactions: {
      url(_ctx: any, interaction: any) {
        // Always use relative URL to keep cookies working
        return `/interaction/${interaction.uid}`;
      },
    },

    // Skip consent in development/testing (auto-approve all prompts except login)
    // Also skip consent for internal (first-party) clients
    async loadExistingGrant(ctx: any) {
      const grantId = (ctx.oidc.result
        && ctx.oidc.result.consent
        && ctx.oidc.result.consent.grantId) || ctx.oidc.session?.grantIdFor(ctx.oidc.client.clientId);

      if (grantId) {
        return ctx.oidc.provider.Grant.find(grantId);
      } else {
        // Check if client is internal (first-party) - skip consent
        const clientCategory = ctx.oidc.client['urn:idem:client_category'];
        const isInternalClient = clientCategory === 'internal';

        // Auto-grant in development OR for internal clients (skip consent prompt)
        if (config.nodeEnv === 'development' || isInternalClient) {
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
            // ADR 0018: 'roles' replaces 'system_role'
            grant.addOIDCClaims(['name', 'given_name', 'family_name', 'picture', 'locale', 'roles']);
          }
          if (scopes.includes('email')) {
            grant.addOIDCClaims(['email', 'email_verified']);
          }

          await grant.save();
          return grant;
        }
      }
    },

    // Error rendering (redirect to frontend error page)
    async renderError(ctx: any, out: any, error: any) {
      // Log full error details (never shown to user)
      logger.error({
        error: error?.message || 'Unknown error',
        errorName: error?.name,
        errorCode: error?.error,
        stack: config.nodeEnv === 'development' ? error?.stack : undefined,
        status: ctx.status,
        path: ctx.path,
        method: ctx.method,
        query: ctx.query,
        oidcDetails: {
          client: ctx.oidc?.client?.clientId,
          session: ctx.oidc?.session?.accountId,
          prompt: ctx.oidc?.prompt?.name,
        },
      }, 'OIDC provider error');

      // Redirect to frontend error page with query params
      const userMessage = config.nodeEnv === 'development'
        ? error?.message || 'An error occurred'
        : 'An error occurred during authentication. Please try again.';

      const params = new URLSearchParams({
        message: userMessage,
      });

      // Include error details in development
      if (config.nodeEnv === 'development') {
        if (error?.name) params.set('errorName', error.name);
        if (error?.error) params.set('errorCode', error.error);
        if (error?.stack) params.set('stack', error.stack);
      }

      ctx.redirect(`/error?${params.toString()}`);
    },
  });

  // CRITICAL: Ensure the internal Koa app trusts proxy headers
  // Without this, redirects will use HTTP even behind HTTPS proxy
  (provider as any).app.proxy = true;

  // Add error event listener for detailed token endpoint errors
  provider.on('grant.error', async (ctx: any, error: any) => {
    const codeVerifier = ctx.oidc?.params?.code_verifier;
    const authCode = ctx.oidc?.entities?.AuthorizationCode;

    // Compute what the challenge SHOULD be from the received verifier
    let computedChallenge = null;
    if (codeVerifier) {
      try {
        const crypto = await import('crypto');
        const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
        computedChallenge = hash;
      } catch (e) {
        computedChallenge = 'computation_failed';
      }
    }

    // Log available entities for debugging
    const availableEntities = ctx.oidc?.entities ? Object.keys(ctx.oidc.entities) : [];

    // Log all error properties to understand the exact cause
    const errorProps = Object.getOwnPropertyNames(error).reduce((acc: any, key) => {
      acc[key] = error[key];
      return acc;
    }, {});

    logger.error({
      error: error.message,
      errorName: error.name,
      errorDescription: error.error_description,
      errorDetail: error.error_detail,
      errorStack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
      allErrorProps: Object.keys(errorProps),
      grantType: ctx.oidc?.params?.grant_type,
      clientId: ctx.oidc?.client?.clientId,
      code: ctx.oidc?.params?.code?.substring(0, 10) + '...',
      codeVerifier: codeVerifier ? `present (${codeVerifier?.length} chars)` : 'missing',
      codeVerifierPrefix: codeVerifier?.substring(0, 20),
      codeVerifierSuffix: codeVerifier?.substring(codeVerifier.length - 20),
      computedChallenge,
      computedChallengePrefix: computedChallenge?.substring(0, 20),
      redirectUri: ctx.oidc?.params?.redirect_uri,
      // Debug: what entities are available
      availableEntities,
      hasAuthCodeEntity: !!authCode,
      // Log the authorization code entity if available
      storedCodeChallenge: authCode?.codeChallenge,
      storedCodeChallengeMethod: authCode?.codeChallengeMethod,
      storedRedirectUri: authCode?.redirectUri,
      storedClientId: authCode?.clientId,
      challengeMatch: computedChallenge && authCode?.codeChallenge
        ? computedChallenge === authCode.codeChallenge
        : 'entity_not_available',
    }, 'Token grant error - PKCE DEBUG');
  });

  // Add listener for successful authorization codes
  provider.on('authorization_code.saved', (code: any) => {
    logger.info({
      codePrefix: code.jti?.substring(0, 10),
      clientId: code.clientId,
      redirectUri: code.redirectUri,
      hasCodeChallenge: !!code.codeChallenge,
      codeChallengeMethod: code.codeChallengeMethod,
    }, 'Authorization code saved');
  });

  // Add listener for code exchange attempts
  provider.on('grant.success', (ctx: any) => {
    const authCode = ctx.oidc?.entities?.AuthorizationCode;
    logger.info({
      grantType: ctx.oidc?.params?.grant_type,
      clientId: ctx.oidc?.client?.clientId,
      // Log PKCE details on success for comparison
      codeVerifierLength: ctx.oidc?.params?.code_verifier?.length,
      storedChallengeLength: authCode?.codeChallenge?.length,
      storedChallengeMethod: authCode?.codeChallengeMethod,
    }, 'Token grant success');
  });

  logger.info({ issuer: config.issuer }, 'OIDC Provider created');
  return provider;
}
