import { Auth0 } from 'arctic';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

export const AuthProviders = {
  Auth0: 'auth0',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];

export const auth0 = new Auth0(
  Environment.NEXT_PUBLIC_AUTH0_DOMAIN,
  Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID),
  Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET),
  `${Environment.NEXT_PUBLIC_APPLICATION_URL}login/auth0/callback`
);
