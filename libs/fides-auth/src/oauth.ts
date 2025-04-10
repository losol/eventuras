import * as openid from 'openid-client';

export const AuthProviders = {
  Auth0: 'auth0',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];

const scope = 'openid profile email offline_access';


export type OAuthConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  callbackUrl?: string;
  scope?: string;
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
  issuer: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<openid.TokenEndpointResponse> {

  const config = await openid.discovery(new URL(issuer), clientId, clientSecret);

  const tokens = await openid.refreshTokenGrant(
    config,
    refreshToken,
    {
      scope,
    },
  );

  return tokens;
}
