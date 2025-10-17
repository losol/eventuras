import {OAuthConfig} from '@eventuras/fides-auth-next';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

export const redirect_uri = Environment.NEXT_PUBLIC_APPLICATION_URL + '/api/login/auth0/callback';

export const oauthConfig: OAuthConfig = {
  issuer: 'https://' + Environment.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID),
  clientSecret: Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET),
  redirect_uri: redirect_uri,
  scope: 'openid profile email offline_access',
};
