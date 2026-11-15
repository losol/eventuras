import { NextResponse } from 'next/server';

import { Logger } from '@eventuras/logger';

import { auth } from '@/utils/auth/fidesAuth';
import { applicationUrl } from '@/utils/oauthConfig';

const logger = Logger.create({ namespace: 'web:api:login' });

/** Sends a logged-in user home and everyone else to the provider. */
export async function GET() {
  const session = await auth.readSession();
  if (session) {
    logger.debug('Session exists, redirecting to homepage');
    return NextResponse.redirect(new URL('/', applicationUrl));
  }
  return NextResponse.redirect(new URL('/api/auth/login', applicationUrl));
}
