import {OAuthConfig} from '@eventuras/fides-auth-next';

// import { appConfig } from '@/config.server';

export const redirect_uri = (process.env.NEXT_PUBLIC_APPLICATION_URL ?? '') + '/api/login/auth0/callback';

export const oauthConfig: OAuthConfig = {
  issuer: 'https://' + (process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ''),
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET ?? '',
  redirect_uri: redirect_uri,
  scope: 'openid profile email offline_access',
};
