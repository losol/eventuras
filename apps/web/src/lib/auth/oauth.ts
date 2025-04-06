import { ClientSecretPost, Configuration, discovery } from 'openid-client';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

export const AuthProviders = {
  Auth0: 'auth0',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];

export const auth0 = {
  issuer: Environment.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID),
  clientSecret: Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET),
  callback_url: `${Environment.NEXT_PUBLIC_APPLICATION_URL}login/auth0/callback`,
};

export async function getAuth0ClientConfig(): Promise<Configuration> {
  console.log('Auth0 client config:', auth0);
  const server = await discovery(
    new URL('https://eventuras.eu.auth0.com'),
    auth0.clientId,
    auth0.clientSecret,
    ClientSecretPost(auth0.clientSecret)
    // {
    //   execute: process.env.NODE_ENV === 'development' ? [allowInsecureRequests] : undefined,
    // }
  );
  if (!server) {
    throw new Error('Auth0 discovery failed');
  }
  console.log('Auth0 server:', server);
  return server;
}
