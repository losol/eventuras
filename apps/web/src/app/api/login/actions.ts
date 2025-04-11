'use server';

import { globalPOSTRateLimit } from '@eventuras/fides-auth/request';
import { deleteSessionCookie, getCurrentSession } from '@eventuras/fides-auth/session';
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

  deleteSessionCookie();
  return redirect('/');
}

interface ActionResult {
  message: string;
}
