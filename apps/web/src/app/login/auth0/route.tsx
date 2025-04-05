import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

import { auth0 } from '@/lib/auth/oauth';
import { globalGETRateLimit } from '@/lib/auth/request';

export async function GET(): Promise<Response> {
  if (!globalGETRateLimit()) {
    return new Response('Too many requests', {
      status: 429,
    });
  }
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  // Consider the codeverifier
  const url = auth0.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

  cookies().set('auth0_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  cookies().set('auth0_oauth_code_verifier', codeVerifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
