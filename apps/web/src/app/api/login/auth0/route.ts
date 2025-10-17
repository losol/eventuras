import {buildAuthorizationUrl, buildPKCEOptions} from '@eventuras/fides-auth-next';
import {globalGETRateLimit} from '@eventuras/fides-auth-next/request';
import { NextRequest, NextResponse } from 'next/server';

import { oauthConfig } from '@/utils/oauthConfig';

export async function GET(request: NextRequest) {
  // 1) Rate‑limit check
  if (!globalGETRateLimit()) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  // 2) Grab our returnTo param (fallback to “/”)
  const returnTo = request.nextUrl.searchParams.get('returnTo');

  // 3) Build PKCE & Auth0 URL
  const pkce = await buildPKCEOptions(oauthConfig);
  const authorizationUrl = await buildAuthorizationUrl(oauthConfig, pkce);

  // 4) Create our redirect response
  const response = NextResponse.redirect(authorizationUrl.toString());

  // 5) Persist our PKCE state & code verifier
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

  // 6) Persist the returnTo so we can redirect back after login
  if (returnTo) {
    response.cookies.set('returnTo', returnTo, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'lax',
    });
  }

  return response;
}
