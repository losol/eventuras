import { NextRequest, NextResponse } from 'next/server';

import { buildPKCEOptions, discoverAndBuildAuthorizationUrl } from '@eventuras/fides-auth-next';
import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';

import { getOAuthConfig } from '@/utils/config';

export async function GET(request: NextRequest) {
  // Rate limit check
  if (!(await globalGETRateLimit())) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  // Grab and validate returnTo param (fallback to "/admin")
  // Prevent open redirect by only allowing relative paths that start with /admin
  const rawReturnTo = request.nextUrl.searchParams.get('returnTo');
  const isValidReturnTo =
    typeof rawReturnTo === 'string' &&
    rawReturnTo.startsWith('/admin') &&
    !rawReturnTo.startsWith('//');
  const returnTo = isValidReturnTo ? rawReturnTo : '/admin';

  // Build PKCE & authorization URL
  const config = getOAuthConfig();
  const pkce = await buildPKCEOptions(config);
  const authorizationUrl = await discoverAndBuildAuthorizationUrl(config, pkce);

  // Create redirect response
  const response = NextResponse.redirect(authorizationUrl.toString());

  // Persist PKCE state & code verifier
  response.cookies.set('oauth_state', pkce.state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });
  response.cookies.set('oauth_code_verifier', pkce.code_verifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  // Persist returnTo for after login
  response.cookies.set('returnTo', returnTo, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  return response;
}
