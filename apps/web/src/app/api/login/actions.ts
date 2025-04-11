'use server';

import { globalPOSTRateLimit } from '@eventuras/fides-auth/request';
import { getCurrentSession } from '@eventuras/fides-auth/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { oauthConfig } from '@/utils/oauthConfig';

export async function logoutAction(): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      message: 'Too many requests',
    };
  }
  const session = await getCurrentSession(oauthConfig);
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }

  cookies().delete('session');

  return redirect('/');
}

interface ActionResult {
  message: string;
}
