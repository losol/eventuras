import { Logger } from '@eventuras/logger';
import * as openid from 'openid-client';

const logger = Logger.create({ namespace: 'fides-auth:oauth' });

// Re-export commonly used types from openid-client for convenience
export type { Configuration, TokenEndpointResponse } from 'openid-client';

export const defaultScope = 'openid profile email offline_access';

export type OAuthConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirect_uri: string;
  scope: string;
};

export async function refreshAccessToken(
  oAuthConfig: OAuthConfig,
  refreshToken: string,
): Promise<openid.TokenEndpointResponse> {
  logger.debug({ issuer: oAuthConfig.issuer }, 'Starting token refresh');

  try {
    const config = await openid.discovery(
      new URL(oAuthConfig.issuer),
      oAuthConfig.clientId,
      oAuthConfig.clientSecret
    );

    const tokens = await openid.refreshTokenGrant(
      config,
      refreshToken,
      {
        scope: oAuthConfig.scope,
      },
    );

    logger.info({
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    }, 'Token refresh successful');

    return tokens;
  } catch (error) {
    // Check if this is an expected invalid_grant error (expired/invalid refresh token)
    const err = error as { code?: string; error?: string; error_description?: string; };
    const isInvalidGrant = err?.code === 'OAUTH_RESPONSE_BODY_ERROR' && err?.error === 'invalid_grant';

    if (isInvalidGrant) {
      // Most often the refresh token has expired - log at info level
      logger.info({
        error: err.error,
        error_description: err.error_description,
        issuer: oAuthConfig.issuer
      }, 'Token refresh failed - refresh token expired or invalid');
    } else {
      // Unexpected error - log at error level
      logger.error({ error, issuer: oAuthConfig.issuer }, 'Token refresh failed');
    }

    throw error;
  }
}

export interface PKCEOptions {
  code_verifier: string;
  code_challenge: string;
  state: string;
  parameters: Record<string, string>;
}

/**
 * Creates PKCE parameters for an OAuth flow.
 *
 * @param config - OAuthConfig configuration including the redirect URI and scope.
 * @returns A promise that resolves to an object containing:
 *  - code_verifier: The randomly generated PKCE code verifier.
 *  - code_challenge: The derived PKCE code challenge.
 *  - state: A random state to protect against CSRF.
 *  - parameters: A Record<string,string> with the assembled parameters.
 */
export async function buildPKCEOptions(config: OAuthConfig): Promise<PKCEOptions> {
  const code_verifier = openid.randomPKCECodeVerifier();
  const code_challenge = await openid.calculatePKCECodeChallenge(code_verifier);
  const state = openid.randomState();

  const parameters: Record<string, string> = {
    redirect_uri: config.redirect_uri,
    scope: config.scope ?? defaultScope,
    code_challenge,
    code_challenge_method: 'S256',
    state,
  };

  logger.info(
    { redirectUri: config.redirect_uri, scope: parameters.scope },
    'PKCE parameters generated'
  );

  return { code_verifier, code_challenge, state, parameters };
}

/**
 * Builds an authorization URL with PKCE parameters.
 *
 * @param config - Discovered OpenID Configuration (use openid.discovery() to obtain)
 * @param pkceOptions - The PKCE options (e.g., code challenge, state, parameters)
 * @returns A Promise that resolves to the authorization URL
 */
export async function buildAuthorizationUrl(
  config: openid.Configuration,
  pkceOptions: PKCEOptions
): Promise<URL> {
  try {
    const authUrl = openid.buildAuthorizationUrl(config, pkceOptions.parameters);
    logger.info({ authUrl: authUrl.origin }, 'Authorization URL built successfully');
    return authUrl;
  } catch (error) {
    logger.error({ error }, 'Failed to build authorization URL');
    throw error;
  }
}

/**
 * Convenience function to discover OpenID configuration and build authorization URL.
 * This combines discovery + buildAuthorizationUrl in one call.
 *
 * @param oauthConfig - Your OAuth configuration
 * @param pkceOptions - The PKCE options (e.g., code challenge, state, parameters)
 * @returns A Promise that resolves to the authorization URL
 */
export async function discoverAndBuildAuthorizationUrl(
  oauthConfig: OAuthConfig,
  pkceOptions: PKCEOptions
): Promise<URL> {
  logger.debug({ issuer: oauthConfig.issuer }, 'Discovering OpenID configuration');

  try {
    const config = await openid.discovery(
      new URL(oauthConfig.issuer),
      oauthConfig.clientId,
      oauthConfig.clientSecret,
      openid.ClientSecretPost(oauthConfig.clientSecret)
    );

    return buildAuthorizationUrl(config, pkceOptions);
  } catch (error) {
    logger.error({ error, issuer: oauthConfig.issuer }, 'Failed to discover config or build URL');
    throw error;
  }
}

/**
 * Configuration for OAuth client credentials flow (machine-to-machine authentication)
 */
export type ClientCredentialsConfig = {
  /** OAuth token endpoint URL */
  tokenEndpoint: string;
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** Optional scope for the access token */
  scope?: string;
};

/**
 * Performs OAuth 2.0 client credentials grant flow for machine-to-machine authentication.
 * This is used when an application needs to access an API on its own behalf (not on behalf of a user).
 *
 * @param config - Client credentials configuration including token endpoint, client ID, and secret
 * @returns A Promise that resolves to the token response from the OAuth provider
 * @throws Error if the token request fails
 *
 * @example
 * ```typescript
 * const tokens = await clientCredentialsGrant({
 *   tokenEndpoint: 'https://api.example.com/oauth2/token',
 *   clientId: 'my-client-id',
 *   clientSecret: 'my-client-secret',
 *   scope: 'api:read api:write',
 * });
 *
 * console.log(tokens.access_token);
 * ```
 */
export async function clientCredentialsGrant(
  config: ClientCredentialsConfig
): Promise<openid.TokenEndpointResponse> {
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    if (config.scope) {
      params.set('scope', config.scope);
    }

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText },
        'Client credentials grant failed'
      );
      throw new Error(`Client credentials grant failed: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as openid.TokenEndpointResponse;
  } catch (error) {
    logger.error({ error, tokenEndpoint: config.tokenEndpoint }, 'Client credentials grant error');
    throw error;
  }
}
