import { globalGETRateLimit } from '@eventuras/fides-auth/request';
import { getCurrentSession } from '@eventuras/fides-auth/session';
import { NextResponse } from 'next/server';

import { oauthConfig } from '@/utils/oauthConfig';

export async function GET() {
  console.log('Starting Auth0 login process...');
  if (!globalGETRateLimit()) {
    return NextResponse.redirect(new URL('/rate-limited', process.env.NEXT_PUBLIC_APPLICATION_URL));
  }

  const session = await getCurrentSession(oauthConfig);
  if (session !== null) {
    // If a session exists, redirect to the homepage
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APPLICATION_URL));
  }

  // If no session exists, redirect to the Auth0 login page
  return NextResponse.redirect(
    new URL('/api/login/auth0', process.env.NEXT_PUBLIC_APPLICATION_URL)
  );
}
