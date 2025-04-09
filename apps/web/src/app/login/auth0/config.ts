import { getAuth0ClientConfig } from '@eventuras/fides-auth/oauth';
import * as openid from 'openid-client';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

export const auth0callbackUrl = Environment.NEXT_PUBLIC_APPLICATION_URL + 'login/auth0/callback';

export const auth0config: openid.Configuration = await getAuth0ClientConfig({
  issuer: 'https://' + Environment.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID ?? 'id'),
  clientSecret: Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET ?? 'secret'),
  callbackUrl: auth0callbackUrl,
});
