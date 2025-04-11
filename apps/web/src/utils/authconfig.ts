import { getAuth0ClientConfig, OAuthConfig } from '@eventuras/fides-auth/oauth';
import * as openid from 'openid-client';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

export const auth0callbackUrl =
  Environment.NEXT_PUBLIC_APPLICATION_URL + 'api/login/auth0/callback';

export const authConfig: OAuthConfig = {
  issuer: 'https://' + Environment.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID),
  clientSecret: Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET),
  callbackUrl: auth0callbackUrl,
  scope: 'openid profile email offline_access',
};

export const auth0config: openid.Configuration = await getAuth0ClientConfig(authConfig);
