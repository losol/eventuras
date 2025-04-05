import { Logger } from '@eventuras/utils';
import * as arctic from 'arctic';
import { cookies } from 'next/headers';

import { auth0, AuthProviders } from '@/lib/auth/oauth';
import { globalGETRateLimit } from '@/lib/auth/request';
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/lib/auth/session';
import { createUser, getUser } from '@/lib/auth/user';

export async function GET(request: Request): Promise<Response> {
  try {
    Logger.info({ namespace: 'login:auth0' }, 'Starting Auth0 callback processing');

    if (!globalGETRateLimit()) {
      Logger.warn({ namespace: 'login:auth0' }, 'Rate limit exceeded');
      return new Response('Too many requests', {
        status: 429,
      });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies().get('auth0_oauth_state')?.value ?? null;
    const storedCodeVerifier = cookies().get('auth0_oauth_code_verifier')?.value ?? null;

    Logger.debug(
      { namespace: 'login:auth0' },
      `OAuth parameters - code: ${code ? 'present' : 'missing'}, state: ${state}, storedState: ${storedState}`
    );

    if (code === null || state === null || storedState === null) {
      Logger.warn({ namespace: 'login:auth0' }, 'Missing required OAuth parameters');
      return new Response('Please restart the process.', {
        status: 400,
      });
    }

    if (state !== storedState) {
      Logger.warn({ namespace: 'login:auth0' }, 'State mismatch');
      return new Response('Please restart the process.', {
        status: 400,
      });
    }

    let tokens: arctic.OAuth2Tokens;
    try {
      Logger.info({ namespace: 'login:auth0' }, 'Validating authorization code');
      tokens = await auth0.validateAuthorizationCode(code, storedCodeVerifier);
      Logger.info({ namespace: 'login:auth0' }, 'Authorization code validated successfully');
    } catch (error) {
      Logger.error({ namespace: 'login:auth0', error }, 'validateAuthorizationCode failed');
      return new Response('Failed to validate authorization code. Please restart the process.', {
        status: 400,
      });
    }

    const auth0AccessToken = tokens.accessToken();
    Logger.info({ namespace: 'login:auth0' }, 'Access token obtained.');

    // Fetch user info from Auth0
    try {
      const userInfoUrl = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/userinfo`;
      Logger.info({ namespace: 'login:auth0' }, `Fetching user info from ${userInfoUrl}`);

      const userRequest = new Request(userInfoUrl);
      userRequest.headers.set('Authorization', `Bearer ${auth0AccessToken}`);

      const userResponse = await fetch(userRequest);

      if (!userResponse.ok) {
        Logger.error(
          { namespace: 'login:auth0' },
          `User info request failed: ${userResponse.status} ${userResponse.statusText}`
        );
        const responseText = await userResponse.text();
        Logger.error({ namespace: 'login:auth0' }, `Response body: ${responseText}`);
        return new Response('Failed to fetch user information. Please restart the process.', {
          status: 500,
        });
      }

      let userResult;
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

      // Get the provider user id
      const providerUserId = userResult.sub || userResult.id || null;
      Logger.info({ namespace: 'login:auth0' }, `Provider user ID: ${providerUserId}`);

      if (providerUserId === null) {
        Logger.warn({ namespace: 'login:auth0' }, 'Provider user ID is missing');
        return new Response('Failed to process user information. Please restart the process.', {
          status: 400,
        });
      }

      // Check if user exists in the database
      const existingUser = await getUser(AuthProviders.Auth0, providerUserId);
      if (existingUser !== null) {
        Logger.info({ namespace: 'login:auth0' }, `Found existing user: ${existingUser.id}`);
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, existingUser.id);
        setSessionTokenCookie(sessionToken, session.expiresAt);
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/',
          },
        });
      }

      // Since we are here, now user exists, so we need to create a new user
      Logger.info({ namespace: 'login:auth0' }, 'Creating new user');
      const user = await createUser(AuthProviders.Auth0, providerUserId, userResult.email);
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user.id);
      setSessionTokenCookie(sessionToken, session.expiresAt);

      Logger.info({ namespace: 'login:auth0' }, 'Redirect to home page');
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      });
    } catch (error) {
      Logger.error({ namespace: 'login:auth0', error }, 'Error processing user info');
      return new Response('An error occurred. Please restart the process.', {
        status: 500,
      });
    }
  } catch (error) {
    Logger.error({ namespace: 'login:auth0', error }, 'Unexpected error in Auth0 callback');
    return new Response('An unexpected error occurred. Please restart the process.', {
      status: 500,
    });
  }
}
