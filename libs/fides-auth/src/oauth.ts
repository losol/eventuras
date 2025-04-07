import { ClientSecretPost, Configuration, discovery } from 'openid-client';

export const AuthProviders = {
  Auth0: 'auth0',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];

export type Auth0Config = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

export async function getAuth0ClientConfig(auth0Config: Auth0Config): Promise<Configuration> {
  const config = await discovery(
    new URL(auth0Config.issuer),
    auth0Config.clientId,
    auth0Config.clientSecret,
    ClientSecretPost(auth0Config.clientSecret)
  );
  return config;
}
