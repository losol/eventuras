'use server';

import { redirect } from 'next/navigation';

import { globalPOSTRateLimit } from '@/lib/auth/request';
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from '@/lib/auth/session';

export async function logoutAction(): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      message: 'Too many requests',
    };
  }
  const { session } = await getCurrentSession();
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }
  invalidateSession(session.id);
  deleteSessionTokenCookie();
  return redirect('/login');
}

interface ActionResult {
  message: string;
}
