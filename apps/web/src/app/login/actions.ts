'use server';

import { globalPOSTRateLimit } from '@eventuras/fides-auth/request';
import { deleteSessionCookie, getCurrentSession } from '@eventuras/fides-auth/session';
import { redirect } from 'next/navigation';

export async function logoutAction(): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      message: 'Too many requests',
    };
  }
  const session = await getCurrentSession();
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }

  deleteSessionCookie();
  return redirect('/login');
}

interface ActionResult {
  message: string;
}
