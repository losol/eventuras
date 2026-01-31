import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { globalGETRateLimit } from '@eventuras/fides-auth-next/request';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({
  namespace: 'idem-admin:auth',
  context: { module: 'logout' },
});

export async function GET() {
  // Rate limit check
  if (!(await globalGETRateLimit())) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  logger.info('User logging out');

  // Clear session cookie
  const cookieStore = await cookies();
  cookieStore.delete('session');

  // Redirect to login page
  return NextResponse.redirect(new URL('/api/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3210'));
}
