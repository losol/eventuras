import { AuthProviders } from '@eventuras/fides-auth/oauth';
import { globalGETRateLimit } from '@eventuras/fides-auth/request';
import { createSession } from '@eventuras/fides-auth/session';
import { createUser, getUser, updateUser } from '@eventuras/fides-auth/user';
import { Logger } from '@eventuras/utils';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import Environment from '@/utils/Environment';

import { auth0callbackUrl, auth0config } from '../config';

export async function GET(request: Request): Promise<Response> {
  // Rate limit the request to avoid abuse
  if (!globalGETRateLimit()) {
    Logger.warn({ namespace: 'login:auth0' }, 'Rate limit exceeded');
    return new Response('Too many requests', { status: 429 });
  }

  // use the public url when sending to auth0
  const current_url = new URL(request.url);
  const public_url = new URL(Environment.NEXT_PUBLIC_APPLICATION_URL);
  public_url.search = current_url.search;

  const storedState = cookies().get('oauth_state')?.value ?? null;
  const storedCodeVerifier = cookies().get('oauth_code_verifier')?.value ?? null;

  if (!storedState || !storedCodeVerifier) {
    Logger.warn({ namespace: 'login:auth0' }, 'Missing stored state or code verifier');
    return new Response('Please restart the process.', { status: 400 });
  }

  const tokenEndpointParameters: Record<string, string> = {
    redirect_uri: auth0callbackUrl,
  };

  Logger.debug({ namespace: 'login:auth0' }, `Requesting tokens.`);
  try {
    const tokens: openid.TokenEndpointResponse = await openid.authorizationCodeGrant(
      auth0config,
      public_url,
      {
        pkceCodeVerifier: storedCodeVerifier.toString(),
        expectedState: storedState.toString(),
      },
      tokenEndpointParameters
    );

    const jwt = await createSession(
      {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
      { sessionDurationDays: 7 }
    );

    Logger.info({ namespace: 'login:auth0' }, 'Redirect to home page');
    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  } catch (error) {
    Logger.error({ namespace: 'login:auth0', error }, 'Unexpected error in Auth0 callback');
    return new Response('An unexpected error occurred. Please restart the process.', {
      status: 500,
    });
  }
}
