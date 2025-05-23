import * as openid from 'openid-client';

export const AuthProviders = {
  Auth0: 'auth0',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];

export const defaultScope = 'openid profile email offline_access';

export type OAuthConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirect_uri: string;
  scope: string;
};



export async function getAuth0ClientConfig(auth0Config: OAuthConfig): Promise<openid.Configuration> {
  const config = await openid.discovery(
    new URL(auth0Config.issuer),
    auth0Config.clientId,
    auth0Config.clientSecret,
    openid.ClientSecretPost(auth0Config.clientSecret)
  );
  return config;
}

export async function refreshAccesstoken(
  oAuthConfig: OAuthConfig,
  refreshToken: string,
): Promise<openid.TokenEndpointResponse> {

  const config = await openid.discovery(new URL(oAuthConfig.issuer), oAuthConfig.clientId, oAuthConfig.clientSecret);

  const tokens = await openid.refreshTokenGrant(
    config,
    refreshToken,
    {
      scope: oAuthConfig.scope,
    },
  );

  return tokens;
}

/**
 * Performs OpenID Connect discovery for your OAuth provider.
 * 
 * @param config - The OAuth configuration parameters including issuer, clientId, and clientSecret.
 * @returns A Promise that resolves to the discovered configuration.
 */
export async function discoverOpenIdConfig(config: OAuthConfig) {
  return await openid.discovery(
    new URL(config.issuer),
    config.clientId,
    config.clientSecret
  );
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

  return { code_verifier, code_challenge, state, parameters };
}

/**
 * Returns an authorization URL by discovering OpenID Connect configuration 
 * and building the URL with PKCE parameters.
 *
 * @param config - Your OAuth configuration.
 * @param pkceOptions - The PKCE options (e.g., code challenge, state, parameters).
 * @returns A Promise that resolves to the authorization URL.
 */
export async function buildAuthorizationUrl(
  config: OAuthConfig,
  pkceOptions: PKCEOptions
): Promise<URL> {
  const server = await discoverOpenIdConfig(config);
  return openid.buildAuthorizationUrl(server, pkceOptions.parameters);
}