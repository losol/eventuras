import { Logger } from '@eventuras/utils';
import { cookies } from 'next/headers';
import * as openid from 'openid-client';

import { auth0, AuthProviders, getAuth0ClientConfig } from '@/lib/auth/oauth';
import { globalGETRateLimit } from '@/lib/auth/request';
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/lib/auth/session';
import { createUser, getUser, updateUser } from '@/lib/auth/user';
import Environment from '@/utils/Environment';

export async function GET(request: Request): Promise<Response> {
  const config: openid.Configuration = await getAuth0ClientConfig();

  Logger.debug({ namespace: 'login:auth0' }, 'Starting Auth0 callback processing');

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
    redirect_uri: auth0.callback_url,
  };

  Logger.debug({ namespace: 'login:auth0' }, `Requesting tokens.`);
  const tokens: openid.TokenEndpointResponse = await openid.authorizationCodeGrant(
    config,
    public_url,
    {
      pkceCodeVerifier: storedCodeVerifier.toString(),
      expectedState: storedState.toString(),
    },
    tokenEndpointParameters
  );

  try {
    // Fetch user info from Auth0
    let userResult;
    try {
      const userInfoUrl = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/userinfo`;
      Logger.info({ namespace: 'login:auth0' }, `Fetching user info from ${userInfoUrl}`);
      const userResponse = await fetch(userInfoUrl, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!userResponse.ok) {
        const responseText = await userResponse.text();
        Logger.error(
          { namespace: 'login:auth0' },
          `User info request failed: ${userResponse.status} ${userResponse.statusText}. Response: ${responseText}`
        );
        return new Response('Failed to fetch user information. Please restart the process.', {
          status: 500,
        });
      }
      try {
        userResult = await userResponse.json();
        Logger.info({ namespace: 'login:auth0' }, 'User info parsed successfully');
        Logger.debug({ namespace: 'login:auth0' }, `User info: ${JSON.stringify(userResult)}`);
      } catch (error) {
        Logger.error(
          { namespace: 'login:auth0', error },
          'Failed to parse user info response as JSON'
        );
        return new Response('Failed to process user information. Please restart the process.', {
          status: 500,
        });
      }
    } catch (error) {
      Logger.error({ namespace: 'login:auth0', error }, 'Error processing user info');
      return new Response('An error occurred. Please restart the process.', { status: 500 });
    }

    // Extract the provider user ID from the user info
    const providerUserId = userResult.sub || userResult.id || null;
    Logger.info({ namespace: 'login:auth0' }, `Provider user ID: ${providerUserId}`);

    if (!providerUserId) {
      Logger.warn({ namespace: 'login:auth0' }, 'Provider user ID is missing');
      return new Response('Failed to process user information. Please restart the process.', {
        status: 400,
      });
    }

    // Extract additional user data from the id token or user info response.
    const userData = {
      email: userResult.email,
      givenName: userResult.given_name,
      familyName: userResult.family_name,
      nickname: userResult.nickname,
      fullName: userResult.name,
      picture: userResult.picture,
      emailVerified: userResult.email_verified,
      roles: userResult['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    };

    // Lookup existing user or create a new one.
    const existingUser = await getUser(AuthProviders.Auth0, providerUserId);
    let user;
    if (existingUser !== null) {
      Logger.info({ namespace: 'login:auth0' }, `Found existing user: ${existingUser.id}`);
      // Update the existing user with the latest info.
      user = await updateUser(AuthProviders.Auth0, providerUserId, userData);
    } else {
      Logger.info({ namespace: 'login:auth0' }, 'Creating new user');
      user = await createUser(AuthProviders.Auth0, providerUserId, userData);
    }

    // Create a new session and set the session token cookie
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
    setSessionTokenCookie(sessionToken, session.expiresAt);

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
